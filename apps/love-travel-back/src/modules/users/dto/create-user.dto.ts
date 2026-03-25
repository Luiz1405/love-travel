import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(3, { message: 'O nome precisa ter pelo menos 3 caracteres.' })
    @MaxLength(100, { message: 'O nome não pode ter mais de 100 caracteres.' })
    name: string;

    @IsEmail({}, { message: 'Email inválido.' })
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'A senha precisa ter pelo menos 8 caracteres.' })
    @MaxLength(20, { message: 'A senha não pode ter mais de 20 caracteres.' })
    password: string;
}