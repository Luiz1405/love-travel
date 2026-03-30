import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common"
import { FeatureFlagGuard } from "../featureFlags/feature-flag-guard"


export function CheckFeatureFlag(flagName: string) {
    return applyDecorators(
        SetMetadata('featureFlag', flagName),
        UseGuards(FeatureFlagGuard),
    )
}