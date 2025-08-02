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
    this.logger.debug(
      '🔄 Preloading settings and web settings into Redis cache...'
    );

    await Promise.all([
      this.syncSettingToCache(),
      this.syncWebSettingToCache(),
    ]);

    this.logger.debug(
      '✅ Redis cache populated with settings and web settings'
    );
  }

  /**
   * Transform web settings rows into a key-value object
   * @param rows - Array of web settings rows from the database
   * @returns Key-value object of settings
   */
  transformWebSettingsRows(rows: ISetting[]): Record<string, string> {
    return rows.reduce((acc, cur) => {
      let message = cur.message;

      // Transform logo URLs
      if (LOGO_TYPES.includes(cur.type as (typeof LOGO_TYPES)[number])) {
        message = message
          ? `${BASE_URL}${WEB_SETTINGS_LOGO_PATH}${message}`
          : '';
      }
      // Transform image URLs
      else if (IMAGE_TYPES.includes(cur.type as (typeof IMAGE_TYPES)[number])) {
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
   * @returns The updated settings map
   */
  async syncSettingToCache(): Promise<Record<string, SettingsDto>> {
    try {
      const rows: ISetting[] = await this.dbService.connection
        .table(SETTINGS_SCHEMA.TABLE)
        .select('*');

      const transformed: SettingsDto[] = transformToString(rows);

      const settingMap: Record<string, SettingsDto> = Object.fromEntries(
        transformed.map((row) => [row.type, row])
      );

      await this.redisService.set(CacheKey.Setting, settingMap);

      this.logger.debug('Settings successfully synced to Redis cache');
      return settingMap;
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
  }): Promise<string | SettingsDto[] | null> {
    try {
      this.logger.debug(
        `Fetching ${
          params.type ? `setting for type: ${params.type}` : 'all settings'
        }`
      );

      const cachedSettings = await this.redisService.get<
        Record<string, SettingsDto>
      >(CacheKey.Setting);

      if (cachedSettings) {
        if (params.type) {
          const setting = cachedSettings[params.type];
          if (setting) {
            this.logger.debug(
              `Returning cached setting for type: ${params.type}`
            );
            return setting.message;
          }
        } else {
          this.logger.debug('Returning all cached settings');
          return Object.values(cachedSettings);
        }
      }

      const query = this.dbService.connection.table(SETTINGS_SCHEMA.TABLE);
      if (params.type) {
        query.where(
          `${SETTINGS_SCHEMA.TABLE}.${SETTINGS_SCHEMA.FIELDS.TYPE}`,
          params.type
        );
      }

      const data = await query.select('*');
      if (!data || data.length === 0) {
        return null;
      }

      const settingsMap = await this.syncSettingToCache();

      return params.type
        ? settingsMap[params.type]?.message ?? null
        : Object.values(settingsMap);
    } catch (error) {
      this.logger.error('Failed to get settings', error);
      return null;
    }
  }

  /**
   * Get all settings
   * @returns All settings as a key-value object
   */
  async findAllSetting(): Promise<Record<string, SettingsDto>> {
    let cachedSettings = await this.redisService.get<
      Record<string, SettingsDto>
    >(CacheKey.Setting);

    if (!cachedSettings) {
      cachedSettings = await this.syncSettingToCache();
    }

    return cachedSettings ?? {};
  }

  /**
   * Set a setting in the database and update the Redis cache
   * @param key - The setting key to set
   * @param value - The value to store for the setting
   */
  async setSetting(key: string, value: string): Promise<void> {
    const exists = await this.dbService.connection
      .table(SETTINGS_SCHEMA.TABLE)
      .where({ type: key })
      .first();

    if (exists) {
      await this.dbService.connection
        .table(SETTINGS_SCHEMA.TABLE)
        .where({ type: key })
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

      const settings = this.transformWebSettingsRows(rows);

      await this.redisService.set(CacheKey.WebSetting, settings);
      this.logger.debug('Web Settings successfully synced to Redis cache');
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
