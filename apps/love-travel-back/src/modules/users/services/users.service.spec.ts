import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from '../entities/user.entity';
import { SecurityService } from 'src/shared/security/security.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { USERS_REPOSITORY, UsersRepository } from '../repositories/contracts/users-repository.contract';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;
  let securityService: SecurityService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  const mockSecurityService = {
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: USERS_REPOSITORY,
          useValue: mockRepository,
        },
        {
          provide: SecurityService,
          useValue: mockSecurityService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(USERS_REPOSITORY);
    securityService = module.get<SecurityService>(SecurityService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar um usuário com dados válidos', async () => {
      const createUserDto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: '12345678',
      };

      const hashedPassword = 'hashed_password_123';
      const createdUser: UserEntity = {
        id: 'user-123',
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSecurityService.hashPassword.mockResolvedValue(hashedPassword);
      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue(createdUser);
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.create(createUserDto);

      expect(result).toEqual(createdUser);
      expect(mockSecurityService.hashPassword).toHaveBeenCalledWith(createUserDto.password);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
        provider: 'local',
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdUser);
    });

    it('deve lançar ConflictException quando email já existe', async () => {
      const createUserDto: CreateUserDto = {
        name: 'João Silva',
        email: 'exists@test.com',
        password: '12345678',
      };

      const existingUser: UserEntity = {
        id: 'user-456',
        name: 'Existing User',
        email: 'exists@test.com',
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      
      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createUserDto)).rejects.toThrow('Email already exists');

      expect(mockSecurityService.hashPassword).toHaveBeenCalledTimes(1);
      expect(mockSecurityService.hashPassword).toHaveBeenCalledWith(createUserDto.password);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('deve verificar se email existe antes de criar', async () => {
      const createUserDto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: '12345678',
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockSecurityService.hashPassword.mockResolvedValue('hashed');
      mockRepository.create.mockReturnValue({} as UserEntity);
      mockRepository.save.mockResolvedValue({} as UserEntity);

      await service.create(createUserDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de usuários sem senha', async () => {
      const mockUsers: UserEntity[] = [
        {
          id: 'user-1',
          name: 'João',
          email: 'joao@test.com',
          password: 'hashed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          name: 'Maria',
          email: 'maria@test.com',
          password: 'hashed',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockRepository.find).toHaveBeenCalledWith({
        select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      });
    });

    it('deve retornar array vazio quando não há usuários', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('findById', () => {
    it('deve retornar usuário quando encontrado', async () => {
      const userId = 'user-123';
      const mockUser: UserEntity = {
        id: userId,
        name: 'João',
        email: 'joao@test.com',
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findById(userId);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      });
    });

    it('deve retornar null quando usuário não encontrado', async () => {
      const userId = 'non-existent';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findById(userId);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('deve retornar usuário quando encontrado', async () => {
      const email = 'joao@test.com';
      const mockUser: UserEntity = {
        id: 'user-123',
        name: 'João',
        email,
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail(email);

      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'name', 'email', 'password'],
      });
    });

    it('deve retornar null quando email não encontrado', async () => {
      const email = 'notfound@test.com';
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail(email);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const userId = 'user-123';
    const existingUser: UserEntity = {
      id: userId,
      name: 'João',
      email: 'joao@test.com',
      password: 'old_hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('deve atualizar usuário quando dados válidos e é o próprio usuário', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'João Silva',
      };

      const updatedUser: UserEntity = {
        ...existingUser,
        name: 'João Silva',
      };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.merge.mockReturnValue(updatedUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(userId, updateUserDto, userId);

      expect(result).toEqual(updatedUser);
      expect(mockRepository.merge).toHaveBeenCalledWith(existingUser, updateUserDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException quando tenta atualizar outro usuário', async () => {
      const updateUserDto: UpdateUserDto = { name: 'João Silva' };
      const otherUserId = 'other-user-456';

      await expect(service.update(userId, updateUserDto, otherUserId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.update(userId, updateUserDto, otherUserId)).rejects.toThrow(
        'You are not allowed to handle this user',
      );

      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      const updateUserDto: UpdateUserDto = { name: 'João Silva' };
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(userId, updateUserDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(userId, updateUserDto, userId)).rejects.toThrow(
        'User not found',
      );
    });

    it('deve atualizar senha quando fornecida', async () => {
      const updateUserDto: UpdateUserDto = {
        password: 'newPassword123',
      };

      const hashedPassword = 'new_hashed_password';
      const updatedUser: UserEntity = {
        ...existingUser,
        password: hashedPassword,
      };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockSecurityService.hashPassword.mockResolvedValue(hashedPassword);
      mockRepository.merge.mockReturnValue(updatedUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      await service.update(userId, updateUserDto, userId);

      expect(mockSecurityService.hashPassword).toHaveBeenCalledWith(updateUserDto.password);
      expect(mockRepository.merge).toHaveBeenCalledWith(existingUser, {
        ...updateUserDto,
        password: hashedPassword,
      });
    });

    it('deve validar email quando alterado', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@test.com',
      };

      mockRepository.findOne.mockResolvedValueOnce(existingUser).mockResolvedValueOnce(null);

      mockRepository.merge.mockReturnValue(existingUser);
      mockRepository.save.mockResolvedValue(existingUser);

      await service.update(userId, updateUserDto, userId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'newemail@test.com' } });
    });

    it('deve lançar ConflictException quando novo email já existe', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'exists@test.com',
      };

      const userWithEmail: UserEntity = {
        id: 'other-user',
        name: 'Other',
        email: 'exists@test.com',
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValueOnce(existingUser).mockResolvedValueOnce(userWithEmail);

      await expect(service.update(userId, updateUserDto, userId)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.update(userId, updateUserDto, userId)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('não deve validar email quando não foi alterado', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'João Silva',
      };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.merge.mockReturnValue(existingUser);
      mockRepository.save.mockResolvedValue(existingUser);

      await service.update(userId, updateUserDto, userId);

      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('delete', () => {
    const userId = 'user-123';
    const existingUser: UserEntity = {
      id: userId,
      name: 'João',
      email: 'joao@test.com',
      password: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('deve deletar usuário quando é o próprio usuário', async () => {
      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.remove.mockResolvedValue(existingUser);

      const result = await service.delete(userId, userId);

      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingUser);
    });

    it('deve lançar ForbiddenException quando tenta deletar outro usuário', async () => {
      const otherUserId = 'other-user-456';

      await expect(service.delete(userId, otherUserId)).rejects.toThrow(ForbiddenException);
      await expect(service.delete(userId, otherUserId)).rejects.toThrow(
        'You are not allowed to handle this user',
      );

      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(userId, userId)).rejects.toThrow(NotFoundException);
      await expect(service.delete(userId, userId)).rejects.toThrow('User not found');
    });
  });
});
