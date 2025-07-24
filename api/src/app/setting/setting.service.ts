import { SettingsDto } from './dto/settings.dto';
import { transformToString } from '../../common/utils/transform.util';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CacheKey } from '../../common/constants/cache-key';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { SETTINGS_SCHEMA } from '../../core/database/schemas';
import { ISetting } from '../../core/database/types';
import { LOGO_TYPES, IMAGE_TYPES } from '../../common/constants/setting-key';
import { WEB_SETTINGS_SCHEMA } from '../../core/database/schemas/web-settings.schema';
import {
  BASE_URL,
  WEB_HOME_SETTINGS_LOGO_PATH,
  WEB_SETTINGS_LOGO_PATH,
} from './../../common/constants/app';

@Injectable()
export class SettingService implements OnModuleInit {
  private readonly logger = new Logger(SettingService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService
  ) {}

  async onModuleInit() {
    this.logger.debug('🔄 Preloading all web settings into Redis cache...');
    await Promise.all([
      this.syncSettingToCache(),
      this.syncWebSettingToCache(),
    ]);
    this.logger.debug('✅ Redis cache populated with web settings');
  }

  /**
   * Transform settings rows into a key-value object
   * @param rows - Array of settings rows from the database
   * @returns Key-value object of settings
   */
  transformSettingsRows(rows: ISetting[]): Record<string, string> {
    return rows.reduce((acc, cur) => {
      let message = cur.message;

      // Transform logo URLs
      if (LOGO_TYPES.includes(cur.type)) {
        message = message
          ? `${BASE_URL}${WEB_SETTINGS_LOGO_PATH}${message}`
          : '';
      }
      // Transform image URLs
      else if (IMAGE_TYPES.includes(cur.type)) {
        message = message
          ? `${BASE_URL}${WEB_HOME_SETTINGS_LOGO_PATH}${message}`
          : '';
      }

      acc[cur.type] = message;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Sync settings to Redis cache
   */
  async syncSettingToCache(): Promise<void> {
    try {
      const rows: ISetting[] = await this.dbService.connection
        .table(SETTINGS_SCHEMA.TABLE)
        .select([`${SETTINGS_SCHEMA.TABLE}.*`]);

      // const settings = this.transformSettingsRows(rows);

      await this.redisService.set(CacheKey.Setting, rows);
      this.logger.debug('Settings successfully synced to Redis cache');
    } catch (error) {
      this.logger.error('Failed to sync settings to Redis cache', error);
      throw error;
    }
  }

  /**
   * Get a specific setting by type
   * @param type - The setting type to retrieve
   * @returns The value of the setting or null if not found
   */
  async getSetting(params: {
    type?: string;
  }): Promise<{ error: boolean; data: SettingsDto | null }> {
    try {
      const cachedSettings = await this.redisService.get<
        Record<string, string>
      >(CacheKey.Setting);

      if (cachedSettings && params.type in cachedSettings) {
        this.logger.debug(`Returning cached setting for type: ${params.type}`);
        return cachedSettings[params.type];
      }

      const query = this.dbService.connection.table(SETTINGS_SCHEMA.TABLE);

      // Add dynamic filters
      if (params.type) {
        query.where(
          `${SETTINGS_SCHEMA.TABLE}.${SETTINGS_SCHEMA.FIELDS.TYPE}`,
          params.type
        );
      }

      const data = await query.select([`${SETTINGS_SCHEMA.TABLE}.*`]);

      if (!data) {
        return null;
      }

      const result: SettingsDto = transformToString(data);

      await this.syncSettingToCache();

      return result;
    } catch (error) {
      this.logger.error('Failed to get settings', error);
      return null;
    }
  }

  /**
   * Get all settings
   * @returns All settings as a key-value object
   */
  async findAllSetting(): Promise<Record<string, string>> {
    let cachedSettings = await this.redisService.get<Record<string, string>>(
      CacheKey.Setting
    );

    if (!cachedSettings) {
      await this.syncSettingToCache();
      cachedSettings = await this.redisService.get<Record<string, string>>(
        CacheKey.Setting
      );
    }

    return cachedSettings ?? {};
  }

  /**
   * Get public settings
   * @returns Public settings as a key-value object
   */
  async setSetting(key: string, value: string): Promise<void> {
    const exists = await this.dbService.connection
      .table(SETTINGS_SCHEMA.TABLE)
      .where({ type: key })
      .first();

    if (exists) {
      await this.dbService.connection
        .table(SETTINGS_SCHEMA.TABLE)
        .where({ key })
        .update({ message: value });
    } else {
      await this.dbService.connection
        .table(SETTINGS_SCHEMA.TABLE)
        .insert({ type: key, message: value });
    }

    await this.syncSettingToCache();
  }

  /**
   * Delete a specific setting by key
   * @param key - The setting key to delete
   */
  async deleteSetting(key: string): Promise<void> {
    await this.dbService.connection
      .table(SETTINGS_SCHEMA.TABLE)
      .where({ type: key })
      .del();
    await this.syncSettingToCache();
  }

  /**
   * Sync web settings to Redis cache
   */
  async syncWebSettingToCache(): Promise<void> {
    try {
      const rows: ISetting[] = await this.dbService.connection
        .table(WEB_SETTINGS_SCHEMA.TABLE)
        .select(
          WEB_SETTINGS_SCHEMA.FIELDS.TYPE,
          WEB_SETTINGS_SCHEMA.FIELDS.MESSAGE
        );

      const settings = this.transformSettingsRows(rows);

      await this.redisService.set(CacheKey.WebSetting, settings);
      this.logger.debug('Settings successfully synced to Redis cache');
    } catch (error) {
      this.logger.error('Failed to sync settings to Redis cache', error);
      throw error;
    }
  }

  /**
   * Get a specific web setting by key
   * @param key - The web setting key to retrieve
   * @returns The value of the web setting or null if not found
   */
  async getWebSetting(key: string): Promise<string | null> {
    const cachedSettings = await this.redisService.get<Record<string, string>>(
      CacheKey.WebSetting
    );

    if (cachedSettings && key in cachedSettings) {
      return cachedSettings[key];
    }

    const result = await this.dbService.connection
      .table(WEB_SETTINGS_SCHEMA.TABLE)
      .where({ type: key })
      .first(WEB_SETTINGS_SCHEMA.FIELDS.MESSAGE);

    await this.syncWebSettingToCache();

    return result ? result.value : null;
  }

  /**
   * Get all web settings
   * @returns All web settings as a key-value object
   */
  async getAllWebSetting(): Promise<Record<string, string>> {
    let cachedSettings = await this.redisService.get<Record<string, string>>(
      CacheKey.WebSetting
    );

    if (!cachedSettings) {
      await this.syncWebSettingToCache();
      cachedSettings = await this.redisService.get<Record<string, string>>(
        CacheKey.WebSetting
      );
    }

    return cachedSettings ?? {};
  }

  /**
   * Get public web settings
   * @returns Public web settings as a key-value object
   */
  async getPublicWebSetting(): Promise<Record<string, string>> {
    let cachedSettings = await this.redisService.get<Record<string, string>>(
      CacheKey.WebSetting
    );

    if (!cachedSettings) {
      await this.syncWebSettingToCache();
      cachedSettings = await this.redisService.get<Record<string, string>>(
        CacheKey.WebSetting
      );
    }

    return cachedSettings ?? {};
  }

  /**
   * Set a web setting
   * @param key - The web setting key to set
   * @param value - The value to set for the web setting
   */
  async setWebSetting(key: string, value: string): Promise<void> {
    const exists = await this.dbService.connection
      .table(WEB_SETTINGS_SCHEMA.TABLE)
      .where({ type: key })
      .first();

    if (exists) {
      await this.dbService.connection
        .table(WEB_SETTINGS_SCHEMA.TABLE)
        .where({ key })
        .update({ message: value });
    } else {
      await this.dbService.connection
        .table(WEB_SETTINGS_SCHEMA.TABLE)
        .insert({ type: key, message: value });
    }

    await this.syncWebSettingToCache();
  }

  /**
   * Delete a specific web setting by key
   * @param key - The web setting key to delete
   */
  async deleteWebSetting(key: string): Promise<void> {
    await this.dbService.connection
      .table(WEB_SETTINGS_SCHEMA.TABLE)
      .where({ type: key })
      .del();
    await this.syncWebSettingToCache();
  }
}
