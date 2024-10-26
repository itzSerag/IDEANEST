import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { RedisController } from './redis.controller';
import { createClient } from 'redis';
import * as retry from 'retry';

@Module({
    controllers: [RedisController],
    providers: [
        RedisService,
        {
            provide: 'REDIS_CLIENT',
            useFactory: async () => {
                const client = createClient({ url: process.env.REDIS_URL });

                const operation = retry.operation({
                    retries: 5,
                    factor: 2,
                    minTimeout: 1000,
                    maxTimeout: 5000,
                });

                await new Promise<void>((resolve, reject) => {
                    operation.attempt(async (currentAttempt) => {
                        try {
                            if (!client.isOpen) {
                                await client.connect();
                                console.log('Connected to Redis');
                                resolve();
                            } else {
                                console.log('Redis client already connected');
                                resolve();
                            }
                        } catch (err) {
                            if (operation.retry(err)) {
                                console.log(
                                    `Retrying Redis connection (attempt ${currentAttempt})...`,
                                );
                                return;
                            }
                            console.error('Failed to connect to Redis:', err);
                            reject(err);
                        }
                    });
                });

                // Add error event listener to handle connection errors
                client.on('error', (err) => {
                    console.error('Redis client error:', err);
                });

                return client;
            },
        },
    ],
    exports: [RedisService],
})
export class RedisModule {}
