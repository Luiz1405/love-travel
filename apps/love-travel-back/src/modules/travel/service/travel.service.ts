import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Travel, TravelDocument } from "src/database/schema/travel.schema";
import { CreateTravelDto } from "../dto/create-user.dto";


export class TravelService {
    @InjectModel(Travel.name)
    private readonly travelModel: Model<TravelDocument>

    async createTravel(createTravelDto: CreateTravelDto): Promise<TravelDocument> {
        const travel = new this.travelModel(createTravelDto);
        return await travel.save();
    }
}