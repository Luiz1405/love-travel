import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Travel, TravelSchema } from "src/database/schema/travel.schema";
import { TravelController } from "./controller/travel.controller";
import { TravelService } from "./service/travel.service";
import { HandleFileSupaBaseService } from "src/utils/handleFileSupaBaseService";


@Module({
    imports: [MongooseModule.forFeature([{ name: Travel.name, schema: TravelSchema }])],
    controllers: [TravelController],
    providers: [
        TravelService,
        {
            provide: 'HandleFileInterface',
            useClass: HandleFileSupaBaseService,
        }
    ],
    exports: [MongooseModule, TravelService]
})
export class TravelModule { }


