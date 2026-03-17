import { Body, Controller, Delete, Get, Param, Patch, Post, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { TravelService } from "../service/travel.service";
import { CreateTravelDto } from "../dto/create-travel.dto";
import { UpdateTravelDto } from "../dto/update-travel.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { GetUser } from "src/utils/decorators/get-user.decorator";
import { ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { ApiStandarErrors } from "src/utils/decorators/swagger.decorator";

@Controller('travels')
export class TravelController {
    constructor(private readonly travelService: TravelService) { }

    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiResponse({ status: 201, description: 'Travel created with success.' })
    @ApiStandarErrors()
    @ApiBearerAuth()
    @UseInterceptors(FilesInterceptor('photos', 10))
    async create(
        @Body() createTravelDto: CreateTravelDto,
        @UploadedFiles() photos: Express.Multer.File[],
        @GetUser('userId') userId: string
    ) {
        return this.travelService.createTravel(createTravelDto, photos, userId);
    }

    @Get()
    @ApiResponse({ status: 200, description: 'Travels found with success.' })
    @UseGuards(JwtAuthGuard)
    async findAll(@GetUser('userId') userId: string) {
        return this.travelService.findAll(userId);
    }

    @Get(':id')
    @ApiResponse({ status: 200, description: 'Travel found with success.' })
    async findById(@Param('id') id: string) {
        return this.travelService.findById(id);
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    @ApiStandarErrors()
    @ApiBearerAuth()
    async update(
        @Param('id') id: string,
        @Body() updateTravelDto: UpdateTravelDto,
        @GetUser('userId') userId: string
    ) {
        return this.travelService.update(id, updateTravelDto, userId);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @ApiStandarErrors()
    @ApiBearerAuth()
    async delete(
        @Param('id') id: string,
        @GetUser('userId') userId: string
    ) {
        return this.travelService.delete(id, userId);
    }
}