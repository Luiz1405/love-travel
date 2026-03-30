import { UserEntity } from "../../entities/user.entity";

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

export interface UsersRepository {
    create(data: Partial<UserEntity>): UserEntity;
    save(user: UserEntity): Promise<UserEntity>;
    find(options: {
        select: Array<keyof UserEntity>;
    }): Promise<UserEntity[]>;
    findOne(options: {
        where: Partial<Pick<UserEntity, 'id' | 'email'>>;
        select?: Array<keyof UserEntity>;
    }): Promise<UserEntity | null>;
    findAll(): Promise<UserEntity[]>;
    findById(id: string): Promise<UserEntity | null>;
    findByIdOrFailSelection(id: string): Promise<UserEntity | null>;
    findByEmail(email: string): Promise<UserEntity | null>;
    merge(user: UserEntity, data: Partial<UserEntity>): UserEntity;
    remove(user: UserEntity): Promise<UserEntity>;
}
