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
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: Travel.name, schema: TravelSchema }]),
        RedisModule,
        TypeOrmModule.forFeature([FeatureFlagEntity]),
        MulterModule.register({
            storage: memoryStorage(),
            limits: {
                fileSize: 10 * 1024 * 1024,
                files: 10,
            },
        }),
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


