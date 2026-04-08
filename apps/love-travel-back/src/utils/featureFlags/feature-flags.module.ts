import { Logger, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DiscoveryModule } from "@nestjs/core";
import { FeatureFlagEntity } from "./feature-flag.entity";
import { FeatureFlagsService } from "./feature-flags.service";
import { FeatureFlagGuard } from "./feature-flag-guard";
import { FeatureFlagExplorer } from "./feature-flags.explorer";

@Module({
    imports: [TypeOrmModule.forFeature([FeatureFlagEntity]), DiscoveryModule],
    providers: [Logger, FeatureFlagsService, FeatureFlagGuard, FeatureFlagExplorer],
    exports: [TypeOrmModule, FeatureFlagsService, FeatureFlagGuard],
})
export class FeatureFlagsModule { }

