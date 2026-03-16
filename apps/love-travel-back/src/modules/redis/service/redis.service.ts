import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common"
import { ConfigService } from "@nestjs/config";
import { createClient, RedisClientType } from "redis";


@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;

    constructor(private readonly configService: ConfigService) {
        this.client = createClient({
            url: `redis://${this.configService.get('REDIS_HOST')}:${this.configService.get('REDIS_PORT')}`,
        });
    }

    async onModuleInit() {
        await this.client.connect();
        console.log('Redis connected');
    }

    async onModuleDestroy() {
        await this.client.disconnect();
        console.log('Redis disconnected');
    }

    async get(key: string) {
        return await this.client.get(key);
    }

    async set(key: string, value: string, ttl: number): Promise<void> {
        await this.client.set(key, value, { EX: ttl });
    }

    async del(key: string) {
        return await this.client.del(key);
    }
}