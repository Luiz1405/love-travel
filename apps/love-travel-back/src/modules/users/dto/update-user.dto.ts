import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, MaxLength } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsString()
    @IsOptional()
    name?: string;

    @IsEmail({}, { message: 'Email inválido.' })
    @IsNotEmpty()
    email?: string;

    @IsString()
    @IsOptional()
    @MinLength(8, { message: 'A senha precisa ter pelo menos 8 caracteres.' })
    @MaxLength(20, { message: 'A senha não pode ter mais de 20 caracteres.' })
    password?: string;
}