import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { TravelService } from "../service/travel.service";
import { CreateTravelDto } from "../dto/create-travel.dto";
import { UpdateTravelDto } from "../dto/update-travel.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { GetUser } from "src/utils/decorators/get-user.decorator";
import { CacheInterceptor, CacheKey, CacheTTL } from "@nestjs/cache-manager";

@Controller('travels')
export class TravelController {
    constructor(private readonly travelService: TravelService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('photos', 10))
    async create(
        @Body() createTravelDto: CreateTravelDto,
        @UploadedFiles() photos: Express.Multer.File[],
        @GetUser('userId') userId: string
    ) {
        return this.travelService.createTravel(createTravelDto, photos, userId);
    }

    @Get()
    @UseInterceptors(CacheInterceptor)
    @CacheKey('all_travels')
    @CacheTTL(60000)
    async findAll(@GetUser('userId') userId: string) {
        return this.travelService.findAll(userId);
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.travelService.findById(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateTravelDto: UpdateTravelDto) {
        return this.travelService.update(id, updateTravelDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.travelService.delete(id);
    }
}