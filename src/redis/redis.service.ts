import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: RedisClientType;
  private readonly redis: Redis;

  constructor(private configService: ConfigService) {
    const url = this.configService.get<string>('REDIS_URL');
    console.log('Conectando ao Redis em:', url);
    this.client = createClient({ url });

    this.client.on('error', (err) => console.error('Redis Client Error', err));

    this.client.connect().catch(console.error);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  async set(
    key: string,
    value: string,
    flag?: string,
    duration?: number,
  ): Promise<void> {
    if (flag && duration) {
      await this.client.set(key, value, { [flag]: duration });
    } else {
      await this.client.set(key, value);
    }
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  async del(key: string | string[]): Promise<void> {
    if (Array.isArray(key)) {
      await this.client.del(key);
    } else {
      await this.client.del([key]);
    }
  }

  async sadd(key: string, value: string): Promise<void> {
    await this.client.sAdd(key, value);
  }

  async srem(key: string, value: string): Promise<void> {
    await this.client.sRem(key, value);
  }

  async smembers(key: string): Promise<string[]> {
    return await this.client.sMembers(key);
  }

  async spop(key: string): Promise<string | null> {
    const result = await this.client.sPop(key);
    return Array.isArray(result) ? result[0] : result;
  }

  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  async publish(channel: string, message: string): Promise<void> {
    await this.client.publish(channel, message);
  }

  async subscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<void> {
    const subscriber = this.client.duplicate();
    await subscriber.connect();
    await subscriber.subscribe(channel, (message) => callback(message));
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    return this.redis.lrange(key, start, stop);
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    return this.redis.rpush(key, ...values);
  }

  async lrem(key: string, count: number, value: string): Promise<number> {
    return this.redis.lrem(key, count, value);
  }

  async lpop(key: string): Promise<string | null> {
    return this.redis.lpop(key);
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    return this.redis.hset(key, field, value);
  }

  async hget(key: string, field: string): Promise<string | null> {
    return this.redis.hget(key, field);
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    return this.redis.hgetall(key);
  }

  async hdel(key: string, ...fields: string[]): Promise<number> {
    return this.redis.hdel(key, ...fields);
  }
}
