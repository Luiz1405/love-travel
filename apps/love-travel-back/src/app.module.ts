import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { NoSqlModule } from './database/nosql.module';
import { UsersModule } from './modules/users/user.module';
import { SecurityModule } from './shared/security/security.module';
import { AuthModule } from './modules/auth/auth.module';
import { TravelModule } from './modules/travel/travel.module';
import { RedisModule } from './modules/redis/redis.module';
import { FeatureFlagsModule } from './utils/featureFlags/feature-flags.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      envFilePath: '.env',
    }),
    DatabaseModule,
    NoSqlModule,
    SecurityModule,
    AuthModule,
    UsersModule,
    TravelModule,
    RedisModule,
    FeatureFlagsModule,
  ],

})
export class AppModule { }
