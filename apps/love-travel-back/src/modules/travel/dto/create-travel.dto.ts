import { Type } from "class-transformer";
import { IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class CreateTravelDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

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
    endDate?: Date;

    @IsNumber()
    @IsNotEmpty()
    total_spent: number;

    @IsString()
    @IsNotEmpty()
    @IsEnum(['planned', 'ongoing', 'completed'])
    status: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    photos?: string[];

    @IsString()
    @IsOptional()
    description?: string;
}