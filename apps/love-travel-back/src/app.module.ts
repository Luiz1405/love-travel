import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { NoSqlModule } from './database/nosql.module';
import { UsersModule } from './modules/users/user.module';
import { SecutiryModule } from './shared/security/secutiry.module';
import { AuthModule } from './modules/auth/auth.module';
import { TravelModule } from './modules/travel/travel.module';
import { RedisModule } from './modules/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      envFilePath: '.env',
    }),
    DatabaseModule,
    NoSqlModule,
    SecutiryModule,
    AuthModule,
    UsersModule,
    TravelModule,
    RedisModule,
  ],

})
export class AppModule { }
