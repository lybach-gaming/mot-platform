import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

import { CacheService } from './cache.service';
import { config } from '../../config/index';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: async () => {
        const keyvRedis = new KeyvRedis(config.redisUrl);
        const keyv = new Keyv({ store: keyvRedis });

        return {
          store: keyv,
          // ttl: 60 * 5 * 1000, // ttl in milliseconds
        };
      },
    }),
  ],
  providers: [CacheService],
  exports: [CacheService],
})
export class RedisCacheModule { }
