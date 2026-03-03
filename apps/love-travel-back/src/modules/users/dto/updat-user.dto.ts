import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail({}, { message: 'Invalid email' })
    @IsNotEmpty()
    email?: string;

    @IsString()
    @IsOptional()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Password must be less than 20 characters' })
    password?: string;
}