import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { FeatureFlagsService } from "./feature-flags.service";
import { Reflector } from "@nestjs/core";

@Injectable()
export class FeatureFlagGuard implements CanActivate {
    constructor(
        private readonly featureFlagsService: FeatureFlagsService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const flagName = this.reflector.get<string>('featureFlag', context.getHandler());

        if (!flagName) return true;

        const enabled = await this.featureFlagsService.isEnabled(flagName);

        if (!enabled) {
            throw new ForbiddenException('Esta funcionalidade não está disponível no momento');
        }

        return true;
    }
}