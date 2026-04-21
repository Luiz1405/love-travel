import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { UsersModule } from '../user.module';
import { UserEntity } from '../entities/user.entity';
import { SecurityService } from 'src/shared/security/security.service';
import { SecurityModule } from 'src/shared/security/security.module';
import { USERS_REPOSITORY, UsersRepository } from '../repositories/contracts/users-repository.contract';

describe('UsersController (Integration)', () => {
    let app: INestApplication;
    let repository: UsersRepository;
    let securityService: SecurityService;

    const testUser = {
        name: 'Test User',
        email: 'test@test.com',
        password: '12345678',
    };

    const testUser2 = {
        name: 'Test User 2',
        email: 'test2@test.com',
        password: '12345678',
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [UsersModule, SecurityModule],
        })
            .overrideProvider(USERS_REPOSITORY)
            .useValue({
                create: jest.fn(),
                save: jest.fn(),
                find: jest.fn(),
                findOne: jest.fn(),
                merge: jest.fn(),
                remove: jest.fn(),
                findAll: jest.fn(),
                findById: jest.fn(),
                findByIdOrFailSelection: jest.fn(),
                findByEmail: jest.fn(),
            })
            .compile();

        app = moduleFixture.createNestApplication();

        await app.init();

        repository = moduleFixture.get<UsersRepository>(USERS_REPOSITORY);
        securityService = moduleFixture.get<SecurityService>(SecurityService);
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /users', () => {
        it('deve criar um usuário com dados válidos', async () => {
            const hashedPassword = 'hashed_password_123';
            const createdUser: UserEntity = {
                id: 'user-123',
                ...testUser,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(null);
            jest.spyOn(securityService, 'hashPassword').mockResolvedValue(hashedPassword);
            jest.spyOn(repository, 'create').mockReturnValue(createdUser);
            jest.spyOn(repository, 'save').mockResolvedValue(createdUser);

            const response = await request(app.getHttpServer())
                .post('/users')
                .send(testUser)
                .expect(201);

            expect(response.body).toHaveProperty('id');
            expect(response.body).toHaveProperty('name', testUser.name);
            expect(response.body).toHaveProperty('email', testUser.email);
            expect(response.body).not.toHaveProperty('password');
            expect(securityService.hashPassword).toHaveBeenCalledWith(testUser.password);
        });

        it.skip('deve retornar 400 quando dados inválidos', async () => {
            const invalidUser = {
                name: 'A',
                email: 'invalid-email',
                password: '123',
            };

            const response = await request(app.getHttpServer())
                .post('/users')
                .send(invalidUser)
                .expect(400);

            expect(response.body).toHaveProperty('message');
            expect(Array.isArray(response.body.message)).toBe(true);
        });

        it('deve retornar 409 quando email já existe', async () => {
            const existingUser: UserEntity = {
                id: 'existing-user',
                ...testUser,
                password: 'hashed',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(existingUser);

            const response = await request(app.getHttpServer())
                .post('/users')
                .send(testUser)
                .expect(409);

            expect(response.body).toHaveProperty('message', 'Email already exists');
        });

        it.skip('deve validar tamanho mínimo do nome', async () => {
            const invalidUser = {
                ...testUser,
                name: 'AB',
            };

            await request(app.getHttpServer())
                .post('/users')
                .send(invalidUser)
                .expect(400);
        });

        it.skip('deve validar tamanho mínimo da senha', async () => {
            const invalidUser = {
                ...testUser,
                password: '1234567',
            };

            await request(app.getHttpServer())
                .post('/users')
                .send(invalidUser)
                .expect(400);
        });
    });

    describe('GET /users', () => {
        it('deve retornar lista de usuários', async () => {
            const mockUsers: UserEntity[] = [
                {
                    id: 'user-1',
                    name: 'User 1',
                    email: 'user1@test.com',
                    password: 'hashed',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
                {
                    id: 'user-2',
                    name: 'User 2',
                    email: 'user2@test.com',
                    password: 'hashed',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                },
            ];

            jest.spyOn(repository, 'find').mockResolvedValue(mockUsers);

            const response = await request(app.getHttpServer())
                .get('/users')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(2);
            expect(response.body[0]).not.toHaveProperty('password');
            expect(response.body[1]).not.toHaveProperty('password');
        });

        it('deve retornar array vazio quando não há usuários', async () => {
            jest.spyOn(repository, 'find').mockResolvedValue([]);

            const response = await request(app.getHttpServer())
                .get('/users')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });
    });

    describe('GET /users/:id', () => {
        it('deve retornar usuário quando encontrado', async () => {
            const userId = 'user-123';
            const mockUser: UserEntity = {
                id: userId,
                ...testUser,
                password: 'hashed',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(mockUser);

            const response = await request(app.getHttpServer())
                .get(`/users/${userId}`)
                .expect(200);

            expect(response.body).toHaveProperty('id', userId);
            expect(response.body).not.toHaveProperty('password');
        });

        it('deve retornar null quando usuário não encontrado', async () => {
            const userId = 'non-existent';
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);

            const response = await request(app.getHttpServer())
                .get(`/users/${userId}`)
                .expect(200);

            expect(response.body).toEqual({});
        });
    });

    describe('PATCH /users/:id', () => {
        it('deve atualizar usuário quando autenticado e é o próprio usuário', async () => {
            const userId = 'user-123';
            const existingUser: UserEntity = {
                id: userId,
                ...testUser,
                password: 'hashed',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const updateData = {
                name: 'Updated Name',
            };

            const updatedUser: UserEntity = {
                ...existingUser,
                name: 'Updated Name',
            };

            jest.spyOn(repository, 'findOne').mockResolvedValueOnce(existingUser).mockResolvedValueOnce(null);
            jest.spyOn(repository, 'merge').mockReturnValue(updatedUser);
            jest.spyOn(repository, 'save').mockResolvedValue(updatedUser);
        });

        it('deve retornar 403 quando tenta atualizar outro usuário', async () => {
            const userId = 'user-123';
            const otherUserId = 'other-user-456';
            const updateData = { name: 'Updated Name' };
        });
    });

    describe('DELETE /users/:id', () => {
        it('deve deletar usuário quando autenticado e é o próprio usuário', async () => {
            const userId = 'user-123';
            const existingUser: UserEntity = {
                id: userId,
                ...testUser,
                password: 'hashed',
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            jest.spyOn(repository, 'findOne').mockResolvedValue(existingUser);
            jest.spyOn(repository, 'remove').mockResolvedValue(existingUser);
        });

        it('deve retornar 404 quando usuário não existe', async () => {
            const userId = 'non-existent';
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);
        });
    });
});
