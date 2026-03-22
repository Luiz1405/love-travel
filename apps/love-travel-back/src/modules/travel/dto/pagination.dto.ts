import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, Max, Min } from "class-validator";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "src/utils/constants/default-page-size";

export class PaginationDto {

    @Type(() => Number)
    @IsInt()
    @IsOptional()
    @Min(0)
    skip: number = 0;

    @Type(() => Number)
    @IsInt()
    @IsPositive()
    @IsOptional()
    @Min(1)
    @Max(MAX_PAGE_SIZE)
    limit: number = DEFAULT_PAGE_SIZE;
}