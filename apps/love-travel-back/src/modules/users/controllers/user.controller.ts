import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';
import { ApiResponse } from '@nestjs/swagger';
import { ApiStandarErrors } from 'src/utils/decorators/swagger.decorator';
import { GetUser } from 'src/utils/decorators/get-user.decorator';
import { AuthApiResponse } from 'src/utils/decorators/auth-endpoint.decorator';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    private excludePassword(user: UserEntity): Omit<UserEntity, 'password'> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    @Get()
    @ApiResponse({ status: 200, description: 'Usuários encontrados com sucesso.' })
    async findAll() {
        const users = await this.usersService.findAll();
        return users.map(user => this.excludePassword(user));
    }

    @Get(':id')
    @ApiResponse({ status: 200, description: 'Usuário encontrado com sucesso.' })
    async findById(@Param('id') id: string) {
        const user = await this.usersService.findById(id);
        return user ? this.excludePassword(user) : null;
    }

    @AuthApiResponse(200, 'Usuário atualizado com sucesso.')
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @GetUser('userId') userId: string) {
        const user = await this.usersService.update(id, updateUserDto, userId);
        return this.excludePassword(user);
    }

    @AuthApiResponse(204, 'Usuário removido com sucesso.')
    @Delete(':id')
    async delete(@Param('id') id: string, @GetUser('userId') userId: string) {
        return this.usersService.delete(id, userId);
    }

    @Post()
    @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
    @ApiStandarErrors()
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return this.excludePassword(user);
    }

}