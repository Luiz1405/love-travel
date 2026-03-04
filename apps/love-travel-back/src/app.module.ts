import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './config/env.validation';
import { DatabaseModule } from './database/database.module';
import { NoSqlModule } from './database/nosql.module';
import { UsersModule } from './modules/users/user.module';
import { SecutiryModule } from './shared/security/secutiry.module';

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
    UsersModule,


  ],

})
export class AppModule { }
