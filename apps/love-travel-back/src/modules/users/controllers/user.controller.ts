import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/updat-user.dto';
import { UserEntity } from '../entities/user.entity';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    private excludePassword(user: UserEntity): Omit<UserEntity, 'password'> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findById(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        const user = await this.usersService.update(id, updateUserDto);
        return this.excludePassword(user);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.usersService.delete(id);
    }

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return this.excludePassword(user);
    }

}