import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserEntity } from "../entities/user.entity";
import { UsersRepository } from "./contracts/users-repository.contract";

export class TypeOrmUsersRepository implements UsersRepository {
    constructor(
        @InjectRepository(UserEntity)
        private readonly repository: Repository<UserEntity>,
    ) { }

    create(data: Partial<UserEntity>): UserEntity {
        return this.repository.create(data);
    }

    save(user: UserEntity): Promise<UserEntity> {
        return this.repository.save(user);
    }

    find(options: { select: Array<keyof UserEntity>; }): Promise<UserEntity[]> {
        return this.repository.find(options);
    }

    findOne(options: {
        where: Partial<Pick<UserEntity, "id" | "email">>;
        select?: Array<keyof UserEntity>;
    }): Promise<UserEntity | null> {
        return this.repository.findOne(options);
    }

    findAll(): Promise<UserEntity[]> {
        return this.repository.find({
            select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
        });
    }

    findById(id: string): Promise<UserEntity | null> {
        return this.repository.findOne({
            where: { id },
            select: ['id', 'name', 'email', 'createdAt', 'updatedAt'],
        });
    }

    findByIdOrFailSelection(id: string): Promise<UserEntity | null> {
        return this.repository.findOne({ where: { id } });
    }

    findByEmail(email: string): Promise<UserEntity | null> {
        return this.repository.findOne({
            where: { email },
            select: ['id', 'name', 'email', 'password'],
        });
    }

    merge(user: UserEntity, data: Partial<UserEntity>): UserEntity {
        return this.repository.merge(user, data);
    }

    remove(user: UserEntity): Promise<UserEntity> {
        return this.repository.remove(user);
    }
}
