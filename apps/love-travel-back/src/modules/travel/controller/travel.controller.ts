import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { TravelService } from "../service/travel.service";
import { CreateTravelDto } from "../dto/create-travel.dto";
import { UpdateTravelDto } from "../dto/update-travel.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { GetUser } from "src/utils/decorators/get-user.decorator";

@Controller('travels')
export class TravelController {
    constructor(private readonly travelService: TravelService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('photos', 10))
    async create(
        @Body() createTravelDto: CreateTravelDto,
        @UploadedFiles() photos: Express.Multer.File[],
        @GetUser('id') userId: string
    ) {
        return this.travelService.createTravel(createTravelDto, photos, userId);
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