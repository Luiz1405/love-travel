import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Travel, TravelDocument } from "src/database/schema/travel.schema";
import { CreateTravelDto } from "../dto/create-travel.dto";
import { Inject, NotFoundException } from "@nestjs/common";
import { UpdateTravelDto } from "../dto/update-travel.dto";
import type { handleFileInterface } from "./../../../utils/contracts/handleFileInterface";


export class TravelService {
    constructor(
        @InjectModel(Travel.name)
        private readonly travelModel: Model<TravelDocument>,

        @Inject('HandleFileInterface')
        private readonly handleFileSupaBaseService: handleFileInterface,
    ) { }

    async createTravel(createTravelDto: CreateTravelDto,
        photos: Express.Multer.File[],
        userId: string
    ): Promise<TravelDocument> {
        createTravelDto.userId = userId;
        createTravelDto.photos = await this.uploadPhotos(photos);

        const travel = new this.travelModel(createTravelDto);

        return await travel.save();
    }

    async findAll(): Promise<TravelDocument[]> {
        return await this.travelModel.find().exec();
    }

    async findById(id: string): Promise<TravelDocument> {
        const travel = await this.travelModel.findById(id).exec();

        if (!travel) {
            throw new NotFoundException('Travel not found');
        }

        return travel;
    }

    async update(id: string, updateTravelDto: UpdateTravelDto): Promise<TravelDocument> {
        const travel = await this.travelModel.findByIdAndUpdate(id, updateTravelDto, { new: true }).exec();

        if (!travel) {
            throw new NotFoundException('Travel not found');
        }

        return travel;
    }

    async delete(id: string): Promise<void> {
        const travel = await this.travelModel.findByIdAndDelete(id).exec();

        if (!travel) {
            throw new NotFoundException('Travel not found');
        }
    }

    private async uploadPhotos(photos: Express.Multer.File[]): Promise<string[]> {

        if (!photos || photos.length === 0) {
            return [];
        }

        const photoUrls = await Promise.all(
            photos.map(photo => this.handleFileSupaBaseService.uploadFile(photo))
        );

        return photoUrls;
    }
}