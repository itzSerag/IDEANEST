import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
    constructor(
        @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
    ) {}

    async addTokenToBlacklist(
        token: string,
        expiration: number,
    ): Promise<void> {
        await this.redisClient.set(token, 'revoked', { EX: expiration });
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const result = await this.redisClient.get(token);
        return result === 'revoked';
    }
}
