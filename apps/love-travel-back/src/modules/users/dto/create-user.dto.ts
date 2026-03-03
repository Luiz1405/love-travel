import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'Name must be at least 3 characters long' })
    @MaxLength(100, { message: 'Name must be less than 100 characters' })
    name: string;

    @IsEmail({}, { message: 'Invalid email' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @MaxLength(20, { message: 'Password must be less than 20 characters' })
    password: string;
}