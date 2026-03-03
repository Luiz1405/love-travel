import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from '../dto/updat-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) { }

    async create(CreateUserDto: CreateUserDto): Promise<UserEntity> {
        const { email, name, password } = CreateUserDto;

        const userExists = await this.userRepository.findOne({ where: { email } });
        if (userExists) {
            throw new ConflictException('User already exists');
        }

        const user = this.userRepository.create({
            name,
            email,
            password: await this.hashPassword(password),
        });

        return await this.userRepository.save(user);
    }

    async findAll(): Promise<UserEntity[]> {
        return await this.userRepository.find({
            select: ['id', 'name', 'email', 'createdAt', 'updatedAt']
        });
    }

    async findById(id: string): Promise<UserEntity | null> {
        return await this.userRepository.findOne({
            where: { id },
            select: ['id', 'name', 'email', 'createdAt', 'updatedAt']
        });
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
        const user = await this.findById(id);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const { name, email, password } = updateUserDto;

        const updateData: Partial<UserEntity> = {
            ...(name !== undefined && { name }),
            ...(email !== undefined && { email }),
            ...(password !== undefined && {
                password: await this.hashPassword(password)
            }),
        };

        this.userRepository.merge(user, updateData);
        return await this.userRepository.save(user);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('User not found');
        }
        return true;
    }

    private async hashPassword(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return await this.userRepository.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'password']
        });
    }
}