import { UsersModule } from "../users/user.module";
import { PassportModule } from "@nestjs/passport";
import { JwtModule } from "@nestjs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtStrategy } from "./jwt.strategy";
import { GoogleStrategy } from "./google.strategy";


@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '1d' },
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy, GoogleStrategy],
    controllers: [AuthController],
})
export class AuthModule { }