import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { TravelService } from "../service/travel.service";
import { CreateTravelDto } from "../dto/create-travel.dto";
import { UpdateTravelDto } from "../dto/update-travel.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { GetUser } from "src/utils/decorators/get-user.decorator";
import { PaginationDto } from "../dto/pagination.dto";
import { SearchPaginationDto } from "../dto/search-pagination.dto";
import { AuthApiResponse } from "src/utils/decorators/auth-endpoint.decorator";
import { CheckFeatureFlag } from "src/utils/decorators/feature-flag-decorator";

@Controller('travels')
export class TravelController {
    constructor(private readonly travelService: TravelService) { }

    @Post()
    @AuthApiResponse(201, 'Viagem criada com sucesso.')
    @UseInterceptors(FilesInterceptor('photos', 10))
    async create(
        @Body() createTravelDto: CreateTravelDto,
        @UploadedFiles() photos: Express.Multer.File[],
        @GetUser('userId') userId: string
    ) {
        return this.travelService.createTravel(createTravelDto, photos, userId);
    }

    @Get()
    @CheckFeatureFlag('travels_list')
    @AuthApiResponse(200, 'Viagens encontradas com sucesso.')
    async findAll(@GetUser('userId') userId: string, @Query() paginationDto: PaginationDto) {
        return this.travelService.findAll(userId, paginationDto);
    }

    @Get('search')
    @AuthApiResponse(200, 'Viagens encontradas com sucesso.')
    async findByAnyInput(@GetUser('userId') userId: string, @Query() query: SearchPaginationDto) {
        return this.travelService.findByAnyInput(userId, query.search ?? '', query);
    }

    @Get(':id')
    @AuthApiResponse(200, 'Viagem encontrada com sucesso.')
    async findById(@Param('id') id: string, @GetUser('userId') userId: string) {
        return this.travelService.findById(id, userId);
    }

    @Patch(':id')
    @AuthApiResponse(200, 'Viagem atualizada com sucesso.')
    @UseInterceptors(FilesInterceptor('photos', 10))
    async update(
        @Param('id') id: string,
        @Body() updateTravelDto: UpdateTravelDto,
        @UploadedFiles() photos: Express.Multer.File[],
        @GetUser('userId') userId: string
    ) {
        return this.travelService.update(id, updateTravelDto, userId, photos);
    }

    @Delete(':id')
    @AuthApiResponse(200, 'Viagem deletada com sucesso.')
    async delete(
        @Param('id') id: string,
        @GetUser('userId') userId: string
    ) {
        return this.travelService.delete(id, userId);
    }
}