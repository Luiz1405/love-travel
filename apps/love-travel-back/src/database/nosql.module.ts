import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";


@Module({
    imports: [
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const mongoUri = configService.get<string>('MONGO_URI');
                const username = configService.get<string>('MONGO_USERNAME');
                const password = configService.get<string>('MONGO_PASSWORD');
                const host = configService.get<string>('MONGO_HOST');
                const port = configService.get<number>('MONGO_PORT');
                const database = configService.get<string>('MONGO_DATABASE') || 'admin';

                const uri =
                    mongoUri && mongoUri.trim().length > 0
                        ? mongoUri
                        : `mongodb://${username}:${password}@${host}:${port}/${database}?authSource=admin`;

                return {
                    uri,
                    dbName: database,
                };
            },
        }),
    ],
})
export class NoSqlModule { }