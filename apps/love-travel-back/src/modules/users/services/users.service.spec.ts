import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserEntity } from '../entities/user.entity';
import { SecurityService } from 'src/shared/security/security.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

/**
 * Testes Unitários - UsersService
 * 
 * Este arquivo contém testes unitários para o UsersService.
 * Testes unitários testam o service isoladamente, usando mocks das dependências.
 * 
 * Estrutura:
 * - describe: Agrupa testes relacionados
 * - beforeEach: Executa antes de cada teste (setup)
 * - it: Teste individual
 * - expect: Verifica se o resultado está correto
 */

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<UserEntity>;
  let securityService: SecurityService;

  // Mock do Repository - simula o banco de dados
  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  // Mock do SecurityService - simula hash de senha
  const mockSecurityService = {
    hashPassword: jest.fn(),
    comparePassword: jest.fn(),
  };

  /**
   * beforeEach: Executa ANTES de cada teste
   * Aqui configuramos o módulo de teste e criamos as instâncias
   */
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          // Mock do TypeORM Repository
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository,
        },
        {
          // Mock do SecurityService
          provide: SecurityService,
          useValue: mockSecurityService,
        },
      ],
    }).compile();

    // Obter instâncias dos serviços
    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    securityService = module.get<SecurityService>(SecurityService);
  });

  /**
   * afterEach: Executa DEPOIS de cada teste
   * Limpa os mocks para não interferir em outros testes
   */
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Grupo de testes: create
   * Testa a criação de usuários
   */
  describe('create', () => {
    it('deve criar um usuário com dados válidos', async () => {
      // Arrange (Preparar)
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

      // Configurar comportamento dos mocks
      mockSecurityService.hashPassword.mockResolvedValue(hashedPassword);
      mockRepository.create.mockReturnValue(createdUser);
      mockRepository.save.mockResolvedValue(createdUser);
      mockRepository.findOne.mockResolvedValue(null); // Email não existe

      // Act (Executar)
      const result = await service.create(createUserDto);

      // Assert (Verificar)
      expect(result).toEqual(createdUser);
      expect(mockSecurityService.hashPassword).toHaveBeenCalledWith(createUserDto.password);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: createUserDto.name,
        email: createUserDto.email,
        password: hashedPassword,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(createdUser);
    });

    it('deve lançar ConflictException quando email já existe', async () => {
      // Arrange
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

      // Email já existe
      mockRepository.findOne.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow(ConflictException);
      await expect(service.create(createUserDto)).rejects.toThrow('Email already exists');
      
      // Verificar que hashPassword NÃO foi chamado (email já existe)
      expect(mockSecurityService.hashPassword).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('deve verificar se email existe antes de criar', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@test.com',
        password: '12345678',
      };

      mockRepository.findOne.mockResolvedValue(null); // Email não existe
      mockSecurityService.hashPassword.mockResolvedValue('hashed');
      mockRepository.create.mockReturnValue({} as UserEntity);
      mockRepository.save.mockResolvedValue({} as UserEntity);

      // Act
      await service.create(createUserDto);

      // Assert
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: createUserDto.email } });
    });
  });

  /**
   * Grupo de testes: findAll
   * Testa a listagem de todos os usuários
   */
  describe('findAll', () => {
    it('deve retornar lista de usuários sem senha', async () => {
      // Arrange
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

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockRepository.find).toHaveBeenCalledWith({
        select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      });
    });

    it('deve retornar array vazio quando não há usuários', async () => {
      // Arrange
      mockRepository.find.mockResolvedValue([]);

      // Act
      const result = await service.findAll();

      // Assert
      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });
  });

  /**
   * Grupo de testes: findById
   * Testa a busca de usuário por ID
   */
  describe('findById', () => {
    it('deve retornar usuário quando encontrado', async () => {
      // Arrange
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

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
      });
    });

    it('deve retornar null quando usuário não encontrado', async () => {
      // Arrange
      const userId = 'non-existent';
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findById(userId);

      // Assert
      expect(result).toBeNull();
    });
  });

  /**
   * Grupo de testes: findByEmail
   * Testa a busca de usuário por email
   */
  describe('findByEmail', () => {
    it('deve retornar usuário quando encontrado', async () => {
      // Arrange
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

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
        select: ['id', 'name', 'email', 'password'],
      });
    });

    it('deve retornar null quando email não encontrado', async () => {
      // Arrange
      const email = 'notfound@test.com';
      mockRepository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByEmail(email);

      // Assert
      expect(result).toBeNull();
    });
  });

  /**
   * Grupo de testes: update
   * Testa a atualização de usuário
   */
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
      // Arrange
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

      // Act
      const result = await service.update(userId, updateUserDto, userId);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockRepository.merge).toHaveBeenCalledWith(existingUser, updateUserDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('deve lançar ForbiddenException quando tenta atualizar outro usuário', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = { name: 'João Silva' };
      const otherUserId = 'other-user-456';

      // Act & Assert
      await expect(service.update(userId, updateUserDto, otherUserId)).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.update(userId, updateUserDto, otherUserId)).rejects.toThrow(
        'You are not allowed to handle this user',
      );

      // Verificar que não tentou buscar no banco
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = { name: 'João Silva' };
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.update(userId, updateUserDto, userId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(userId, updateUserDto, userId)).rejects.toThrow(
        'User not found',
      );
    });

    it('deve atualizar senha quando fornecida', async () => {
      // Arrange
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

      // Act
      await service.update(userId, updateUserDto, userId);

      // Assert
      expect(mockSecurityService.hashPassword).toHaveBeenCalledWith(updateUserDto.password);
      expect(mockRepository.merge).toHaveBeenCalledWith(existingUser, {
        ...updateUserDto,
        password: hashedPassword,
      });
    });

    it('deve validar email quando alterado', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        email: 'newemail@test.com',
      };

      mockRepository.findOne
        .mockResolvedValueOnce(existingUser) // Primeira chamada: buscar usuário
        .mockResolvedValueOnce(null); // Segunda chamada: verificar se email existe

      mockRepository.merge.mockReturnValue(existingUser);
      mockRepository.save.mockResolvedValue(existingUser);

      // Act
      await service.update(userId, updateUserDto, userId);

      // Assert
      // Deve verificar se o novo email já existe
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email: 'newemail@test.com' } });
    });

    it('deve lançar ConflictException quando novo email já existe', async () => {
      // Arrange
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

      mockRepository.findOne
        .mockResolvedValueOnce(existingUser) // Usuário existe
        .mockResolvedValueOnce(userWithEmail); // Email já existe

      // Act & Assert
      await expect(service.update(userId, updateUserDto, userId)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.update(userId, updateUserDto, userId)).rejects.toThrow(
        'Email already exists',
      );
    });

    it('não deve validar email quando não foi alterado', async () => {
      // Arrange
      const updateUserDto: UpdateUserDto = {
        name: 'João Silva',
        // Email não foi alterado
      };

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.merge.mockReturnValue(existingUser);
      mockRepository.save.mockResolvedValue(existingUser);

      // Act
      await service.update(userId, updateUserDto, userId);

      // Assert
      // Deve buscar usuário apenas uma vez (não verificar email)
      expect(mockRepository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  /**
   * Grupo de testes: delete
   * Testa a exclusão de usuário
   */
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
      // Arrange
      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.remove.mockResolvedValue(existingUser);

      // Act
      const result = await service.delete(userId, userId);

      // Assert
      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: userId } });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingUser);
    });

    it('deve lançar ForbiddenException quando tenta deletar outro usuário', async () => {
      // Arrange
      const otherUserId = 'other-user-456';

      // Act & Assert
      await expect(service.delete(userId, otherUserId)).rejects.toThrow(ForbiddenException);
      await expect(service.delete(userId, otherUserId)).rejects.toThrow(
        'You are not allowed to handle this user',
      );

      // Verificar que não tentou buscar no banco
      expect(mockRepository.findOne).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException quando usuário não existe', async () => {
      // Arrange
      mockRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.delete(userId, userId)).rejects.toThrow(NotFoundException);
      await expect(service.delete(userId, userId)).rejects.toThrow('User not found');
    });
  });
});
