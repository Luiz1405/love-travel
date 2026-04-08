import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { DiscoveryService, MetadataScanner, Reflector } from "@nestjs/core";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { FeatureFlagEntity } from "./feature-flag.entity";

@Injectable()
export class FeatureFlagExplorer implements OnModuleInit {
    constructor(
        private readonly discoveryService: DiscoveryService,
        private readonly metadataScanner: MetadataScanner,
        private readonly reflector: Reflector,
        @InjectRepository(FeatureFlagEntity)
        private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
        private readonly logger: Logger,
    ) { }

    async onModuleInit(): Promise<void> {
        const controllers = this.discoveryService.getControllers();
        const discoveredFlagNames = new Set<string>();

        for (const wrapper of controllers) {
            const instance = wrapper.instance as Record<string, unknown> | undefined;
            if (!instance) continue;

            const prototype = Object.getPrototypeOf(instance) as object;
            this.metadataScanner.scanFromPrototype(instance, prototype, (methodKey: string) => {
                const handler = instance[methodKey];
                if (typeof handler !== "function") return;
                const flagName = this.reflector.get<string | undefined>("featureFlag", handler);
                if (typeof flagName === "string" && flagName.length > 0) {
                    discoveredFlagNames.add(flagName);
                }
            });
        }

        if (discoveredFlagNames.size === 0) return;

        const names = Array.from(discoveredFlagNames);
        const existing = await this.featureFlagRepository.find({ where: { name: In(names) } });
        const existingNames = new Set(existing.map((f) => f.name));

        const toCreate = names
            .filter((name) => !existingNames.has(name))
            .map((name) => this.featureFlagRepository.create({ name, isActive: false }));

        if (toCreate.length > 0) {
            await this.featureFlagRepository.save(toCreate);
            this.logger.log(`Feature flags synced: ${toCreate.length} new flag(s) created`, FeatureFlagExplorer.name);
        }
    }
}

