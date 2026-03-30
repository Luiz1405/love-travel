import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FeatureFlagEntity } from "./feature-flag.entity";


export class FeatureFlagsService {
    constructor(
        @InjectRepository(FeatureFlagEntity)
        private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    ) { }

    async isEnabled(flagName: string): Promise<boolean> {
        const featureFlag = await this.featureFlagRepository.findOne({ where: { name: flagName } });
        return featureFlag?.isActive ?? false;
    }

}