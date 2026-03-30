import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { UsersController } from "./controllers/user.controller";
import { UsersService } from "./services/users.service";
import { USERS_REPOSITORY } from "./repositories/contracts/users-repository.contract";
import { TypeOrmUsersRepository } from "./repositories/typeorm-users.repository";


@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [UsersController],
    providers: [
        UsersService,
        TypeOrmUsersRepository,
        {
            provide: USERS_REPOSITORY,
            useExisting: TypeOrmUsersRepository,
        },
    ],
    exports: [TypeOrmModule, UsersService]
})
export class UsersModule { }