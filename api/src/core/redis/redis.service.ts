import Redis from 'ioredis';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL!);
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await this.client.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, serialized);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async deleteByPattern(pattern: string): Promise<void> {
    try {
      // Get all keys matching pattern
      const stream = this.client.scanStream({
        match: pattern,
        count: 100, // Process 100 keys at a time
      });

      // Process keys in batches
      let pipeline = this.client.pipeline();
      let keysToDelete = 0;

      for await (const keys of stream) {
        // Add delete commands to pipeline
        for (const key of keys) {
          pipeline.del(key);
          keysToDelete++;
        }

        // Execute pipeline when batch is full
        if (keysToDelete >= 100) {
          await pipeline.exec();
          pipeline = this.client.pipeline();
          keysToDelete = 0;
        }
      }

      // Execute any remaining commands
      if (keysToDelete > 0) {
        await pipeline.exec();
      }
    } catch (error) {
      throw new Error(`Failed to delete keys matching pattern ${pattern}:`, {
        cause: error,
      });
    }
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.client.expire(key, ttlSeconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async flushAll(): Promise<void> {
    await this.client.flushall();
  }
}
