import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { TravelService } from './travel.service';
import { Travel, TravelDocument } from 'src/database/schema/travel.schema';
import { RedisService } from 'src/modules/redis/service/redis.service';
import { CreateTravelDto } from '../dto/create-travel.dto';
import { UpdateTravelDto } from '../dto/update-travel.dto';
import { PaginationDto } from '../dto/pagination.dto';
import type { handleFileInterface } from 'src/utils/contracts/handleFileInterface';

/**
 * Testes Unitários - TravelService
 * 
 * Este arquivo contém testes unitários para o TravelService.
 * Testa a lógica de negócio relacionada a viagens.
 * 
 * Componentes testados:
 * - Criação de viagens
 * - Listagem de viagens (com paginação)
 * - Busca de viagem por ID
 * - Atualização de viagens
 * - Exclusão de viagens
 * - Upload de fotos
 * - Validação de propriedade
 */

describe('TravelService', () => {
    let service: TravelService;
    let travelModel: Model<TravelDocument>;
    let handleFileService: handleFileInterface;
    let redisService: RedisService;

    // Mock do Mongoose Model
    const mockTravelModel = {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        exec: jest.fn(),
    };

    // Mock do HandleFileService (Supabase)
    const mockHandleFileService: handleFileInterface = {
        uploadFile: jest.fn(),
        deleteFile: jest.fn(),
        verifyFileType: jest.fn(),
        verifyFileSize: jest.fn(),
    };

    // Mock do RedisService
    const mockRedisService = {
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
    };

    // Dados de teste
    const userId = 'user-123';
    const travelId = 'travel-123';
    const mockTravel: TravelDocument = {
        _id: travelId,
        userId,
        title: 'Viagem para Paris',
        destination: 'Paris',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-10'),
        total_spent: 5000,
        status: 'planned',
        photos: [],
        description: 'Uma viagem incrível',
        createdAt: new Date(),
        updatedAt: new Date(),
    } as TravelDocument;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TravelService,
                {
                    provide: getModelToken(Travel.name),
                    useValue: mockTravelModel,
                },
                {
                    provide: 'HandleFileInterface',
                    useValue: mockHandleFileService,
                },
                {
                    provide: RedisService,
                    useValue: mockRedisService,
                },
            ],
        }).compile();

        service = module.get<TravelService>(TravelService);
        travelModel = module.get<Model<TravelDocument>>(getModelToken(Travel.name));
        handleFileService = module.get<handleFileInterface>('HandleFileInterface');
        redisService = module.get<RedisService>(RedisService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * Grupo de testes: createTravel
     * Testa criação de viagens
     */
    describe('createTravel', () => {
        it('deve criar uma viagem com dados válidos e sem fotos', async () => {
            // Arrange
            const createTravelDto: CreateTravelDto = {
                userId,
                title: 'Viagem para Paris',
                destination: 'Paris',
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-01-10'),
                total_spent: 5000,
                status: 'planned',
                photos: [],
            };

            const photos: Express.Multer.File[] = [];
            const createdTravel = { ...mockTravel, ...createTravelDto };

            mockTravelModel.create.mockResolvedValue(createdTravel);
            mockRedisService.del.mockResolvedValue(1);

            // Act
            const result = await service.createTravel(createTravelDto, photos, userId);

            // Assert
            expect(result).toEqual(createdTravel);
            expect(mockTravelModel.create).toHaveBeenCalledWith(createTravelDto);
            expect(mockRedisService.del).toHaveBeenCalledWith(`travels_user_${userId}`);
        });

        it('deve criar uma viagem com fotos válidas', async () => {
            // Arrange
            const createTravelDto: CreateTravelDto = {
                userId,
                title: 'Viagem para Paris',
                destination: 'Paris',
                startDate: new Date('2024-01-01'),
                total_spent: 5000,
                status: 'planned',
            };

            const photo1: Express.Multer.File = {
                fieldname: 'photos',
                originalname: 'photo1.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                size: 1024,
                buffer: Buffer.from('fake-image-data'),
                destination: '',
                filename: '',
                path: '',
                stream: null as any,
            };

            const photo2: Express.Multer.File = {
                ...photo1,
                originalname: 'photo2.jpg',
            };

            const photos = [photo1, photo2];
            const photoUrls = ['https://supabase.com/photo1.jpg', 'https://supabase.com/photo2.jpg'];

            mockHandleFileService.verifyFileType.mockReturnValue(true);
            mockHandleFileService.verifyFileSize.mockReturnValue(true);
            mockHandleFileService.uploadFile
                .mockResolvedValueOnce(photoUrls[0])
                .mockResolvedValueOnce(photoUrls[1]);

            const createdTravel = {
                ...mockTravel,
                ...createTravelDto,
                photos: photoUrls,
            };

            mockTravelModel.create.mockResolvedValue(createdTravel);
            mockRedisService.del.mockResolvedValue(1);

            // Act
            const result = await service.createTravel(createTravelDto, photos, userId);

            // Assert
            expect(result).toEqual(createdTravel);
            expect(mockHandleFileService.verifyFileType).toHaveBeenCalledTimes(2);
            expect(mockHandleFileService.verifyFileSize).toHaveBeenCalledTimes(2);
            expect(mockHandleFileService.uploadFile).toHaveBeenCalledTimes(2);
            expect(result.photos).toEqual(photoUrls);
        });

        it('deve lançar BadRequestException quando tipo de arquivo inválido', async () => {
            // Arrange
            const createTravelDto: CreateTravelDto = {
                userId,
                title: 'Viagem',
                destination: 'Paris',
                startDate: new Date('2024-01-01'),
                total_spent: 5000,
                status: 'planned',
            };

            const invalidPhoto: Express.Multer.File = {
                fieldname: 'photos',
                originalname: 'document.pdf',
                encoding: '7bit',
                mimetype: 'application/pdf',
                size: 1024,
                buffer: Buffer.from('fake-data'),
                destination: '',
                filename: '',
                path: '',
                stream: null as any,
            };

            mockHandleFileService.verifyFileType.mockReturnValue(false);

            // Act & Assert
            await expect(
                service.createTravel(createTravelDto, [invalidPhoto], userId),
            ).rejects.toThrow(BadRequestException);
            await expect(
                service.createTravel(createTravelDto, [invalidPhoto], userId),
            ).rejects.toThrow('Invalid file type');
        });

        it('deve lançar BadRequestException quando tamanho de arquivo excede limite', async () => {
            // Arrange
            const createTravelDto: CreateTravelDto = {
                userId,
                title: 'Viagem',
                destination: 'Paris',
                startDate: new Date('2024-01-01'),
                total_spent: 5000,
                status: 'planned',
            };

            const largePhoto: Express.Multer.File = {
                fieldname: 'photos',
                originalname: 'large.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                size: 11 * 1024 * 1024, // 11MB (acima do limite de 10MB)
                buffer: Buffer.from('fake-data'),
                destination: '',
                filename: '',
                path: '',
                stream: null as any,
            };

            mockHandleFileService.verifyFileType.mockReturnValue(true);
            mockHandleFileService.verifyFileSize.mockReturnValue(false);

            // Act & Assert
            await expect(
                service.createTravel(createTravelDto, [largePhoto], userId),
            ).rejects.toThrow(BadRequestException);
            await expect(
                service.createTravel(createTravelDto, [largePhoto], userId),
            ).rejects.toThrow('File size is too large');
        });

        it('deve deletar fotos se criação de viagem falhar', async () => {
            // Arrange
            const createTravelDto: CreateTravelDto = {
                userId,
                title: 'Viagem',
                destination: 'Paris',
                startDate: new Date('2024-01-01'),
                total_spent: 5000,
                status: 'planned',
            };

            const photo: Express.Multer.File = {
                fieldname: 'photos',
                originalname: 'photo.jpg',
                encoding: '7bit',
                mimetype: 'image/jpeg',
                size: 1024,
                buffer: Buffer.from('fake-data'),
                destination: '',
                filename: '',
                path: '',
                stream: null as any,
            };

            const photoUrl = 'https://supabase.com/photo.jpg';

            mockHandleFileService.verifyFileType.mockReturnValue(true);
            mockHandleFileService.verifyFileSize.mockReturnValue(true);
            mockHandleFileService.uploadFile.mockResolvedValue(photoUrl);
            mockTravelModel.create.mockRejectedValue(new Error('Database error'));
            mockHandleFileService.deleteFile.mockResolvedValue();

            // Act & Assert
            await expect(service.createTravel(createTravelDto, [photo], userId)).rejects.toThrow();

            // Verificar que deleteFile foi chamado para limpar fotos
            expect(mockHandleFileService.deleteFile).toHaveBeenCalledWith(photoUrl);
        });
    });

    /**
     * Grupo de testes: findAll
     * Testa listagem de viagens com paginação
     */
    describe('findAll', () => {
        it('deve retornar viagens do usuário com paginação', async () => {
            // Arrange
            const paginationDto: PaginationDto = {
                skip: 0,
                limit: 10,
            };

            const mockTravels: TravelDocument[] = [mockTravel, { ...mockTravel, _id: 'travel-456' }];

            mockRedisService.get.mockResolvedValue(null); // Sem cache
            mockTravelModel.find.mockReturnValue({
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockTravels),
            } as any);
            mockRedisService.set.mockResolvedValue();

            // Act
            const result = await service.findAll(userId, paginationDto);

            // Assert
            expect(result).toEqual(mockTravels);
            expect(mockTravelModel.find).toHaveBeenCalledWith({ userId });
            expect(mockRedisService.set).toHaveBeenCalled();
        });

        it('deve retornar dados do cache quando disponível', async () => {
            // Arrange
            const paginationDto: PaginationDto = {
                skip: 0,
                limit: 10,
            };

            const cachedTravels = [mockTravel];
            const cacheKey = `travels_user_${userId}:${paginationDto.skip}:${paginationDto.limit}`;

            mockRedisService.get.mockResolvedValue(JSON.stringify(cachedTravels));

            // Act
            const result = await service.findAll(userId, paginationDto);

            // Assert
            // Quando dados vêm do Redis, as datas são serializadas como strings
            expect(result).toEqual(JSON.parse(JSON.stringify(cachedTravels)));
            expect(mockRedisService.get).toHaveBeenCalledWith(cacheKey);
            expect(mockTravelModel.find).not.toHaveBeenCalled();
        });

        it('deve aplicar skip e limit corretamente', async () => {
            // Arrange
            const paginationDto: PaginationDto = {
                skip: 10,
                limit: 5,
            };

            const queryBuilder = {
                skip: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue([]),
            };

            mockRedisService.get.mockResolvedValue(null);
            mockTravelModel.find.mockReturnValue(queryBuilder as any);

            // Act
            await service.findAll(userId, paginationDto);

            // Assert
            expect(queryBuilder.skip).toHaveBeenCalledWith(10);
            expect(queryBuilder.limit).toHaveBeenCalledWith(5);
        });
    });

    /**
     * Grupo de testes: findById
     * Testa busca de viagem por ID
     */
    describe('findById', () => {
        it('deve retornar viagem quando encontrada e pertence ao usuário', async () => {
            // Arrange
            mockTravelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockTravel),
            } as any);

            // Act
            const result = await service.findById(travelId, userId);

            // Assert
            expect(result).toEqual(mockTravel);
            expect(mockTravelModel.findById).toHaveBeenCalledWith(travelId);
        });

        it('deve lançar NotFoundException quando viagem não encontrada', async () => {
            // Arrange
            mockTravelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            } as any);

            // Act & Assert
            await expect(service.findById(travelId, userId)).rejects.toThrow(NotFoundException);
            await expect(service.findById(travelId, userId)).rejects.toThrow('Travel not found');
        });

        it('deve lançar ForbiddenException quando viagem não pertence ao usuário', async () => {
            // Arrange
            const otherUserId = 'other-user-456';
            const otherUserTravel: TravelDocument = {
                ...mockTravel,
                userId: otherUserId,
            };

            mockTravelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(otherUserTravel),
            } as any);

            // Act & Assert
            await expect(service.findById(travelId, userId)).rejects.toThrow(ForbiddenException);
            await expect(service.findById(travelId, userId)).rejects.toThrow(
                'You are not allowed to view this travel',
            );
        });
    });

    /**
     * Grupo de testes: update
     * Testa atualização de viagens
     */
    describe('update', () => {
        it('deve atualizar viagem quando pertence ao usuário', async () => {
            // Arrange
            const updateTravelDto: UpdateTravelDto = {
                title: 'Viagem Atualizada',
            };

            const updatedTravel: TravelDocument = {
                ...mockTravel,
                title: 'Viagem Atualizada',
            };

            mockTravelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockTravel),
            } as any);
            mockTravelModel.findByIdAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(updatedTravel),
            } as any);
            mockRedisService.del.mockResolvedValue(1);

            // Act
            const result = await service.update(travelId, updateTravelDto, userId);

            // Assert
            expect(result).toEqual(updatedTravel);
            expect(mockTravelModel.findByIdAndUpdate).toHaveBeenCalledWith(
                travelId,
                updateTravelDto,
                { new: true },
            );
            expect(mockRedisService.del).toHaveBeenCalledWith(`travels_user_${userId}`);
        });

        it('deve lançar NotFoundException quando viagem não existe', async () => {
            // Arrange
            const updateTravelDto: UpdateTravelDto = { title: 'Nova' };

            mockTravelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            } as any);

            // Act & Assert
            await expect(service.update(travelId, updateTravelDto, userId)).rejects.toThrow(
                NotFoundException,
            );
        });

        it('deve lançar ForbiddenException quando viagem não pertence ao usuário', async () => {
            // Arrange
            const updateTravelDto: UpdateTravelDto = { title: 'Nova' };
            const otherUserTravel: TravelDocument = {
                ...mockTravel,
                userId: 'other-user',
            };

            mockTravelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(otherUserTravel),
            } as any);

            // Act & Assert
            await expect(service.update(travelId, updateTravelDto, userId)).rejects.toThrow(
                ForbiddenException,
            );
        });
    });

    /**
     * Grupo de testes: delete
     * Testa exclusão de viagens
     */
    describe('delete', () => {
        it('deve deletar viagem quando pertence ao usuário', async () => {
            // Arrange
            mockTravelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockTravel),
            } as any);
            mockTravelModel.findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockTravel),
            } as any);
            mockRedisService.del.mockResolvedValue(1);

            // Act
            await service.delete(travelId, userId);

            // Assert
            expect(mockTravelModel.findByIdAndDelete).toHaveBeenCalledWith(travelId);
            expect(mockRedisService.del).toHaveBeenCalledWith(`travels_user_${userId}`);
        });

        it('deve deletar fotos quando viagem tem fotos', async () => {
            // Arrange
            const travelWithPhotos: TravelDocument = {
                ...mockTravel,
                photos: ['https://supabase.com/photo1.jpg', 'https://supabase.com/photo2.jpg'],
            };

            mockTravelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(travelWithPhotos),
            } as any);
            mockTravelModel.findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockResolvedValue(travelWithPhotos),
            } as any);
            mockHandleFileService.deleteFile.mockResolvedValue();
            mockRedisService.del.mockResolvedValue(1);

            // Act
            await service.delete(travelId, userId);

            // Assert
            expect(mockHandleFileService.deleteFile).toHaveBeenCalledTimes(2);
            expect(mockHandleFileService.deleteFile).toHaveBeenCalledWith(
                'https://supabase.com/photo1.jpg',
            );
            expect(mockHandleFileService.deleteFile).toHaveBeenCalledWith(
                'https://supabase.com/photo2.jpg',
            );
        });

        it('não deve falhar se deleção de fotos falhar', async () => {
            // Arrange
            const travelWithPhotos: TravelDocument = {
                ...mockTravel,
                photos: ['https://supabase.com/photo1.jpg'],
            };

            mockTravelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(travelWithPhotos),
            } as any);
            mockTravelModel.findByIdAndDelete.mockReturnValue({
                exec: jest.fn().mockResolvedValue(travelWithPhotos),
            } as any);
            mockHandleFileService.deleteFile.mockRejectedValue(new Error('Delete failed'));
            mockRedisService.del.mockResolvedValue(1);

            // Act - Não deve lançar erro
            await expect(service.delete(travelId, userId)).resolves.not.toThrow();
        });

        it('deve lançar NotFoundException quando viagem não existe', async () => {
            // Arrange
            mockTravelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            } as any);

            // Act & Assert
            await expect(service.delete(travelId, userId)).rejects.toThrow(NotFoundException);
        });

        it('deve lançar ForbiddenException quando viagem não pertence ao usuário', async () => {
            // Arrange
            const otherUserTravel: TravelDocument = {
                ...mockTravel,
                userId: 'other-user',
            };

            mockTravelModel.findById.mockReturnValue({
                exec: jest.fn().mockResolvedValue(otherUserTravel),
            } as any);

            // Act & Assert
            await expect(service.delete(travelId, userId)).rejects.toThrow(ForbiddenException);
        });
    });
});
