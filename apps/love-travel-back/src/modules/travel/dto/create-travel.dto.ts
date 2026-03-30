import { Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, MaxLength } from "class-validator";
import { TravelStatus } from "../enum/travel-status.enum";
import { IsAfter } from "src/utils/decorators/is-after.decorator";


export class CreateTravelDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    destination: string;

    @Type(() => Date)
    @IsDate()
    @IsNotEmpty()
    startDate: Date;

    @Type(() => Date)
    @IsDate()
    @IsOptional()
    @IsAfter('startDate')
    endDate?: Date;

    @IsNumber()
    @IsPositive({ message: 'Total gasto deve ser um número positivo ou maior que 0.' })
    @IsNotEmpty()
    @Type(() => Number)
    total_spent: number;

    @IsString()
    @IsNotEmpty()
    @IsEnum(TravelStatus)
    status: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    photos?: string[];

    @IsString()
    @IsOptional()
    @MaxLength(1000, { message: 'A descrição não pode ter mais de 1000 caracteres.' })
    description?: string;
}