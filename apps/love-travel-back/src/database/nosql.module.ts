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
                const database = configService.get<string>('MONGO_DATABASE') || 'love-travel';

                if (mongoUri && mongoUri.trim().length > 0) {
                    return {
                        uri: mongoUri,
                        dbName: database,
                    };
                }
                const username = configService.get<string>('MONGO_USERNAME');
                const password = configService.get<string>('MONGO_PASSWORD');
                const host = configService.get<string>('MONGO_HOST') || 'localhost';
                const port = configService.get<number>('MONGO_PORT') || 27017;

                return {
                    uri: `mongodb://${username}:${password}@${host}:${port}`,
                    dbName: database,
                };
            },
        }),
    ],
})
export class NoSqlModule { }