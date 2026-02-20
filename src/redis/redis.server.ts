import { Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private redisClient: Redis;

  onModuleInit() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    });

    console.log('Redis Connected');
  }

  async set(key: string, value: string) {
    await this.redisClient.set(key, value);
  }

  async get(key: string) {
    return this.redisClient.get(key);
  }
}
