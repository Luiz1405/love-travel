import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { SecurityService } from 'src/shared/security/security.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
        private readonly securityService: SecurityService,
    ) { }

    async create(CreateUserDto: CreateUserDto): Promise<UserEntity> {
        const { email, name, password } = CreateUserDto;

        const emailExists = await this.userRepository.findOne({ where: { email } });
        if (emailExists) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await this.securityService.hashPassword(password);

        const user = this.userRepository.create({
            name,
            email,
            password: hashedPassword,
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
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const { email, password } = updateUserDto;

        if (email && email !== user.email) {
            if (await this.emailExists(email)) {
                throw new ConflictException('Email already exists');
            }
        }

        if (password) {
            updateUserDto.password = await this.securityService.hashPassword(password);
        }

        this.userRepository.merge(user, updateUserDto);

        return await this.userRepository.save(user);
    }

    async delete(id: string): Promise<boolean> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException('User not found');
        }
        return true;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return await this.userRepository.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'password']
        });
    }

    private async emailExists(email: string): Promise<boolean> {
        const emailExists = await this.userRepository.findOne({ where: { email } });
        return emailExists ? true : false;
    }
}