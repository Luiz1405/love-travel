import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserEntity } from '../entities/user.entity';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ApiStandarErrors } from 'src/utils/decorators/swagger.decorator';
import { GetUser } from 'src/utils/decorators/get-user.decorator';


@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    private excludePassword(user: UserEntity): Omit<UserEntity, 'password'> {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    @Get()
    @ApiResponse({ status: 200, description: 'Users found with success.' })
    async findAll() {
        const users = await this.usersService.findAll();
        return users.map(user => this.excludePassword(user));
    }

    @Get(':id')
    @ApiResponse({ status: 200, description: 'User found with success.' })
    async findById(@Param('id') id: string) {
        const user = await this.usersService.findById(id);
        return user ? this.excludePassword(user) : null;
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiStandarErrors()
    @ApiResponse({ status: 200, description: 'User updated with success.' })
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @GetUser('userId') userId: string) {
        const user = await this.usersService.update(id, updateUserDto, userId);
        return this.excludePassword(user);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiStandarErrors()
    @ApiResponse({ status: 204, description: 'User deleted with success.' })
    @Delete(':id')
    async delete(@Param('id') id: string, @GetUser('userId') userId: string) {
        return this.usersService.delete(id, userId);
    }

    @Post()
    @ApiResponse({ status: 201, description: 'User created with success.' })
    @ApiStandarErrors()
    async create(@Body() createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        return this.excludePassword(user);
    }

}