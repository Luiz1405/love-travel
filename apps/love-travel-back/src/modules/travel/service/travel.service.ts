import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Travel, TravelDocument } from "src/database/schema/travel.schema";
import { CreateTravelDto } from "../dto/create-travel.dto";
import { BadGatewayException, BadRequestException, ForbiddenException, HttpException, Inject, NotFoundException } from "@nestjs/common";
import { UpdateTravelDto } from "../dto/update-travel.dto";
import type { handleFileInterface } from "./../../../utils/contracts/handleFileInterface";
import { RedisService } from "src/modules/redis/service/redis.service";
import { PaginationDto } from "../dto/pagination.dto";

export class TravelService {
    constructor(
        @InjectModel(Travel.name)
        private readonly travelModel: Model<TravelDocument>,

        @Inject('HandleFileInterface')
        private readonly handleFileSupaBaseService: handleFileInterface,

        private readonly redisService: RedisService,

    ) { }

    async createTravel(createTravelDto: CreateTravelDto,
        photos: Express.Multer.File[],
        userId: string
    ): Promise<TravelDocument> {

        try {
            createTravelDto.photos = await this.uploadPhotos(photos);

            const newTravel = await this.travelModel.create({ ...createTravelDto, userId });

            await this.deleteOldCache(userId);

            return newTravel;
        } catch (err: unknown) {
            // Extra logging to help diagnose production issues (Supabase, DB, etc.)
            const details: Record<string, unknown> = {};
            if (err instanceof Error) {
                details.message = err.message;
                details.name = err.name;
                details.stack = err.stack;
                if (typeof err === 'object' && err !== null) {
                    type WithCause = { cause?: unknown };
                    details.cause = (err as WithCause).cause;
                }
            } else {
                details.message = String(err);
            }
            console.error('createTravel failed', details);
            if (createTravelDto?.photos?.length) {
                await this.deletePhotos(createTravelDto.photos).catch(() => { });
            }

            if (err instanceof HttpException) throw err;
            throw new BadGatewayException('Falha ao processar upload das fotos.');
        }
    }

    async findAll(userId: string, paginationDto: PaginationDto): Promise<Travel[]> {
        const { skip, limit } = paginationDto;

        const cacheKey = `travels_user_${userId}:${skip}:${limit}`;

        const cachedItems = await this.redisService.get(cacheKey);
        if (cachedItems) {
            return JSON.parse(cachedItems) as TravelDocument[];
        }

        const travels = await this.travelModel
            .find({ userId: userId })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        await this.redisService.set(cacheKey, JSON.stringify(travels), 3600000);

        return travels;
    }

    async findById(id: string, userId: string): Promise<TravelDocument> {
        const travel = await this.travelModel.findById(id).exec();

        if (!travel) {
            throw new NotFoundException('Travel not found');
        }

        if (!this.belongsToUser(travel, userId)) {
            throw new ForbiddenException('You are not allowed to view this travel');
        }

        return travel;
    }

    async findByAnyInput(userId: string, searchItem: string, paginationDto: PaginationDto): Promise<Travel[]> {
        const { skip, limit } = paginationDto;
        return this.travelModel.find({
            userId,
            $or: [
                { title: { $regex: searchItem ?? '', $options: 'i' } },
                { destination: { $regex: searchItem ?? '', $options: 'i' } },
                { status: { $regex: searchItem ?? '', $options: 'i' } },
            ],
        })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();
    }

    async update(
        id: string,
        updateTravelDto: UpdateTravelDto,
        userId: string,
        photos: Express.Multer.File[] = [],
    ): Promise<TravelDocument | null> {
        const travel = await this.travelExists(id);

        if (!travel) {
            throw new NotFoundException("Travel not found");
        }

        if (!this.belongsToUser(travel, userId)) {
            throw new ForbiddenException('You are not allowed to update this travel');
        }

        const uploadedPhotos = await this.uploadPhotos(photos);
        const nextPhotos = uploadedPhotos.length
            ? [...(travel.photos ?? []), ...uploadedPhotos]
            : updateTravelDto.photos;

        const payloadToUpdate: UpdateTravelDto = {
            ...updateTravelDto,
            ...(nextPhotos ? { photos: nextPhotos } : {}),
        };

        const updatedTravel = await this.travelModel.findByIdAndUpdate(id, payloadToUpdate, { new: true }).exec();

        await this.deleteOldCache(userId);

        return updatedTravel;
    }

    async delete(id: string, userId: string): Promise<void> {
        const travel = await this.travelExists(id);

        if (!travel) {
            throw new NotFoundException('Travel not found');
        }

        if (!this.belongsToUser(travel, userId)) {
            throw new ForbiddenException('You are not allowed to delete this travel');
        }

        await this.deleteOldCache(userId);

        await this.travelModel.findByIdAndDelete(id).exec();

        if (travel.photos && travel.photos.length > 0) {
            await this.deletePhotos(travel.photos).catch(() => {
                console.error('Failed to delete photos');
            });
        }
    }

    private async uploadPhotos(photos: Express.Multer.File[]): Promise<string[]> {

        if (!photos || photos.length === 0) {
            return [];
        }

        photos.forEach(photo => {
            if (!this.handleFileSupaBaseService.verifyFileType(photo)) {
                throw new BadRequestException('Invalid file type');
            }
            if (!this.handleFileSupaBaseService.verifyFileSize(photo)) {
                throw new BadRequestException('File size is too large');
            }
        });

        const photoUrls = await Promise.all(
            photos.map(photo => this.handleFileSupaBaseService.uploadFile(photo))
        );

        return photoUrls;
    }

    private belongsToUser(travel: TravelDocument, userId: string): boolean {
        return travel.userId === userId;
    }

    private async travelExists(id: string): Promise<TravelDocument | null> {
        const travel = await this.travelModel.findById(id).exec();

        if (!travel) {
            return null;
        }

        return travel;
    }

    private async deletePhotos(photoUrls: string[]): Promise<void> {
        const results = await Promise.allSettled(
            photoUrls.map(url => this.handleFileSupaBaseService.deleteFile(url))
        );

        results.forEach((result) => {
            if (result.status === 'rejected') {
                console.error(`Error deleting photo:`, result.reason);
            }
        });
    }

    private async deleteOldCache(userId: string): Promise<void> {
        await this.redisService.delByPattern(`travels_user_${userId}:*`).catch(() => { });
    }
}