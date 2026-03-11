import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { TravelService } from "../service/travel.service";
import { CreateTravelDto } from "../dto/create-travel.dto";
import { UpdateTravelDto } from "../dto/update-travel.dto";
import { FilesInterceptor } from "@nestjs/platform-express";

@Controller('travels')
export class TravelController {
    constructor(private readonly travelService: TravelService) { }

    @Post()
    @UseInterceptors(FilesInterceptor('photos', 10))
    async create(@Body() createTravelDto: CreateTravelDto, @UploadedFiles() photos: Express.Multer.File[]) {
        return this.travelService.createTravel(createTravelDto, photos);
    }

    @Get()
    async findAll() {
        return this.travelService.findAll();
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