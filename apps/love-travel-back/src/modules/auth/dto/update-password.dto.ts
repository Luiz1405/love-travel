import { IsEmail, IsNotEmpty, MaxLength, MinLength } from "class-validator";


export class UpdatePasswordDto {
    @IsEmail({}, { message: 'Email inválido.' })
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    @MinLength(8, { message: 'A senha precisa ter pelo menos 8 caracteres.' })
    @MaxLength(20, { message: 'A senha não pode ter mais de 20 caracteres.' })
    password: string;
}