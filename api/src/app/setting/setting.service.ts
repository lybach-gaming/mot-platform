import { Injectable, OnModuleInit } from '@nestjs/common';
import { CacheKey } from '../../common/constants/cache-key';
import { DatabaseService } from '../../core/database/database.service';
import { AppLogger } from '../../core/logger/app-logger';
import { RedisService } from '../../core/redis/redis.service';

@Injectable()
export class SettingService implements OnModuleInit {
  private readonly logger = new AppLogger(SettingService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService
  ) {}

  async onModuleInit() {
    this.logger.logDev('🔄 Preloading all web settings into Redis cache...');
    await this.syncSettingToCache();
    this.logger.logDev('✅ Redis cache populated with web settings');
  }

  /**
   * Setting Management
   */
  async syncSettingToCache(): Promise<void> {
    const rows = await this.dbService.connection
      .table('tbl_settings')
      .select('type', 'message');

    const Setting = rows.reduce((acc, cur) => {
      acc[cur.type] = cur.message;
      return acc;
    }, {} as Record<string, string>);

    await this.redisService.set(CacheKey.WebSetting, Setting);
  }

  async getSetting(key: string): Promise<string | null> {
    const cachedSettings = await this.redisService.get<Record<string, string>>(
      CacheKey.WebSetting
    );

    if (cachedSettings && key in cachedSettings) {
      return cachedSettings[key];
    }

    const result = await this.dbService.connection
      .table('tbl_settings')
      .where({ type: key })
      .first('message');

    await this.syncSettingToCache();

    return result ? result.value : null;
  }

  async findAllSetting(): Promise<Record<string, string>> {
    let cachedSettings = await this.redisService.get<Record<string, string>>(
      CacheKey.WebSetting
    );

    if (!cachedSettings) {
      await this.syncSettingToCache();
      cachedSettings = await this.redisService.get<Record<string, string>>(
        CacheKey.WebSetting
      );
    }

    return cachedSettings ?? {};
  }

  async setSetting(key: string, value: string): Promise<void> {
    const exists = await this.dbService.connection
      .table('tbl_settings')
      .where({ type: key })
      .first();

    if (exists) {
      await this.dbService.connection
        .table('tbl_settings')
        .where({ key })
        .update({ message: value });
    } else {
      await this.dbService.connection
        .table('tbl_settings')
        .insert({ type: key, message: value });
    }

    await this.syncSettingToCache();
  }

  async deleteSetting(key: string): Promise<void> {
    await this.dbService.connection
      .table('tbl_settings')
      .where({ type: key })
      .del();
    await this.syncSettingToCache();
  }
}
