import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Travel, TravelSchema } from "src/database/schema/travel.schema";
import { TravelController } from "./controllers/travel.controller";
import { TravelService } from "./service/travel.service";
import { HandleFileSupaBaseService } from "src/utils/handleFileSupaBaseService";
import { SupabaseService } from "src/config/supabase.config";
import { RedisModule } from "../redis/redis.module";
import { FeatureFlagsModule } from "src/utils/featureFlags/feature-flags.module";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: Travel.name, schema: TravelSchema }]),
        RedisModule,
        FeatureFlagsModule,
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
        {
            provide: 'HandleFileInterface',
            useClass: HandleFileSupaBaseService,
        }
    ],
    exports: [MongooseModule, TravelService]
})
export class TravelModule { }


