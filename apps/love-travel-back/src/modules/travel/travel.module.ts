import { Logger, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Travel, TravelSchema } from "src/database/schema/travel.schema";
import { TravelController } from "./controllers/travel.controller";
import { TravelService } from "./service/travel.service";
import { HandleFileSupaBaseService } from "src/utils/handleFileSupaBaseService";
import { SupabaseService } from "src/config/supabase.config";
import { RedisModule } from "../redis/redis.module";


@Module({
    imports: [
        MongooseModule.forFeature([{ name: Travel.name, schema: TravelSchema }]),
        RedisModule
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


