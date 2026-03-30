import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Travel, TravelSchema } from "src/database/schema/travel.schema";
import { TravelController } from "./controllers/travel.controller";
import { TravelService } from "./service/travel.service";
import { HandleFileSupaBaseService } from "src/utils/handleFileSupaBaseService";
import { SupabaseService } from "src/config/supabase.config";
import { RedisModule } from "../redis/redis.module";
import { FeatureFlagsService } from "src/utils/featureFlags/feature-flags.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FeatureFlagEntity } from "src/utils/featureFlags/feature-flag.entity";
import { FeatureFlagGuard } from "src/utils/featureFlags/feature-flag-guard";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: Travel.name, schema: TravelSchema }]),
        RedisModule,
        TypeOrmModule.forFeature([FeatureFlagEntity]),
    ],
    controllers: [TravelController],
    providers: [
        SupabaseService,
        TravelService,
        Logger,
        FeatureFlagsService,
        FeatureFlagGuard,
        {
            provide: 'HandleFileInterface',
            useClass: HandleFileSupaBaseService,
        }
    ],
    exports: [MongooseModule, TravelService]
})
export class TravelModule { }


