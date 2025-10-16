import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private redisClient: Redis;
  constructor(
    private configService: ConfigService,
  ) {
    this.redisClient = new Redis(this.configService.get<string>('REDIS_URL'));
  }

  // Set a value in the cache with a specified key and TTL
  async set<T>(key: string, value: string, ttl?: number): Promise<void> {
    await this.redisClient.set(key, value, 'EX', ttl);
  }

  // Get a value from the cache by key
  async get<T>(key: string): Promise<string> {
    return this.redisClient.get(key);
  }

  // Delete a value from the cache by key
  async del(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  // Clear all values from the cache
  async reset(): Promise<void> {
    await this.redisClient.reset();
  }

  // Get the time to live of a key
  async ttl(key: string): Promise<number | undefined> {
    // return await this.cacheManager.ttl(key);
    return await this.redisClient.ttl(key);
  }

  // Additional methods specific to CacheService can be added here
}
