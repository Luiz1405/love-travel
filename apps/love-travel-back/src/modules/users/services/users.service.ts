import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UserEntity } from '../entities/user.entity';
import { UpdateUserDto } from '../dto/update-user.dto';
import { SecurityService } from 'src/shared/security/security.service';
import type { UsersRepository } from '../repositories/contracts/users-repository.contract';
import { USERS_REPOSITORY } from '../repositories/contracts/users-repository.contract';

@Injectable()
export class UsersService {
    constructor(
        @Inject(USERS_REPOSITORY)
        private readonly userRepository: UsersRepository,
        private readonly securityService: SecurityService,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<UserEntity> {
        const hashedPassword = await this.securityService.hashPassword(createUserDto.password);
        return this.persistUser({ ...createUserDto, password: hashedPassword, provider: 'local' });
    }

    async createWithGoogle(data: any): Promise<UserEntity> {
        return this.persistUser({ ...data, password: null, provider: 'google' });
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

    async update(id: string, updateUserDto: UpdateUserDto, userId: string): Promise<UserEntity> {
        this.userIsAuthenticated(id, userId);

        const user = await this.findUserOrFail(id);
        await this.validateEmailChange(user, updateUserDto.email);

        const preparedDto = await this.prepareUpdateDto(updateUserDto);
        this.userRepository.merge(user, preparedDto);

        return await this.userRepository.save(user);
    }

    async delete(id: string, userId: string): Promise<boolean> {
        this.userIsAuthenticated(id, userId);

        const user = await this.findUserOrFail(id);
        await this.userRepository.remove(user);

        return true;
    }

    async findByEmail(email: string): Promise<UserEntity | null> {
        return await this.userRepository.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'password']
        });
    }

    private userIsAuthenticated(id: string, userId: string): void {
        if (id !== userId) {
            throw new ForbiddenException('You are not allowed to handle this user');
        }
    }

    private async findUserOrFail(id: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: { id }
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }
        return user;
    }

    private async validateEmailChange(user: UserEntity, newEmail?: string): Promise<void> {
        if (!newEmail || newEmail === user.email) {
            return;
        }

        const emailExists = await this.emailExists(newEmail);
        if (emailExists) {
            throw new ConflictException('Email already exists');
        }
    }

    private async prepareUpdateDto(updateUserDto: UpdateUserDto): Promise<UpdateUserDto> {
        const preparedDto = { ...updateUserDto };
        if (preparedDto.password) {
            preparedDto.password = await this.securityService.hashPassword(preparedDto.password);
        }
        return preparedDto;
    }

    private async emailExists(email: string): Promise<boolean> {
        const emailExists = await this.userRepository.findOne({ where: { email } });
        return !!emailExists;
    }

    private async persistUser(data: Partial<UserEntity>): Promise<UserEntity> {
        if (!data.email) {
            throw new BadRequestException('Email is required');
        }
        const emailExists = await this.emailExists(data.email);
        if (emailExists) {
            throw new ConflictException('Email already exists');
        }

        const user = this.userRepository.create(data);
        return await this.userRepository.save(user);
    }
}