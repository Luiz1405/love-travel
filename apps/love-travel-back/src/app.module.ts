import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { NoSqlModule } from './database/nosql.module';
import { UsersModule } from './modules/users/user.module';
import { SecutiryModule } from './shared/security/secutiry.module';
import { AuthModule } from './modules/auth/auth.module';
import { TravelModule } from './modules/travel/travel.module';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        store: await redisStore({
          url: `redis://${configService.get('REDIS_HOST')}:${configService.get('REDIS_PORT')}`,
          ttl: 60000
        }),
      }),
    }),
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
  ],

})
export class AppModule { }
