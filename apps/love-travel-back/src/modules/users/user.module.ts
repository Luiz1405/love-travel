import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entities/user.entity";
import { UsersController } from "./controllers/user.controller";
import { UsersService } from "./services/users.service";


@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [UsersController],
    providers: [UsersService],
    exports: [TypeOrmModule, UsersService]
})
export class UsersModule { }