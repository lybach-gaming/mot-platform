import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CacheKey } from '../../common/constants/cache-key';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { SETTINGS_SCHEMA } from '../../core/database/schemas';
import { ISetting } from '../../core/database/types';
import { WebSettingType } from '../../common/constants/setting-key';
import { WEB_SETTINGS_SCHEMA } from '../../core/database/schemas/web-settings.schema';

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

  transformSettingsRows(rows: ISetting[]): Record<string, string> {
    return rows.reduce((acc, cur) => {
      acc[cur.type] = cur.message;
      return acc;
    }, {} as Record<string, string>);
  }

  /**
   * Setting Management
   */
  async syncSettingToCache(): Promise<void> {
    try {
      const rows: ISetting[] = await this.dbService.connection
        .table(SETTINGS_SCHEMA.TABLE)
        .select(SETTINGS_SCHEMA.FIELDS.TYPE, SETTINGS_SCHEMA.FIELDS.MESSAGE);

      const settings = this.transformSettingsRows(rows);

      await this.redisService.set(CacheKey.Setting, settings);
      this.logger.debug('Settings successfully synced to Redis cache');
    } catch (error) {
      this.logger.error('Failed to sync settings to Redis cache', error);
      throw error;
    }
  }

  async getSetting(key: string): Promise<string | null> {
    const cachedSettings = await this.redisService.get<Record<string, string>>(
      CacheKey.Setting
    );

    if (cachedSettings && key in cachedSettings) {
      return cachedSettings[key];
    }

    const result = await this.dbService.connection
      .table(SETTINGS_SCHEMA.TABLE)
      .where({ type: key })
      .first(SETTINGS_SCHEMA.FIELDS.MESSAGE);

    await this.syncSettingToCache();

    return result ? result.value : null;
  }

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

  async deleteSetting(key: string): Promise<void> {
    await this.dbService.connection
      .table(SETTINGS_SCHEMA.TABLE)
      .where({ type: key })
      .del();
    await this.syncSettingToCache();
  }

  /**
   * Web Setting Management
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

    await this.syncSettingToCache();

    return result ? result.value : null;
  }

  async getAllWebSetting(): Promise<Record<string, string>> {
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

  async getPublicWebSetting(): Promise<Record<string, string>> {
    const publicSettings = [
      WebSettingType.FirebaseApiKey,
      WebSettingType.FirebaseAuthDomain,
      WebSettingType.FirebaseDatabaseUrl,
      WebSettingType.FirebaseProjectId,
      WebSettingType.FirebaseStorageBucket,
      WebSettingType.FirebaseMessagerSenderId,
      WebSettingType.FirebaseAppId,
      WebSettingType.FirebaseMeasurementId,
      WebSettingType.MetaDescription,
      WebSettingType.MetaKeywords,
      WebSettingType.RtlSupport,
      WebSettingType.ShowRecommendationsWidget,
      WebSettingType.FacebookLinkFooter,
      WebSettingType.TwitterLinkFooter,
      WebSettingType.TiktokLinkFooter,
      WebSettingType.InstagramLinkFooter,
      WebSettingType.LinkedinLinkFooter,
      WebSettingType.YoutubeLinkFooter,
      WebSettingType.TelegramLinkFooter,
      WebSettingType.Favicon,
      WebSettingType.HeaderLogo,
      WebSettingType.FooterLogo,
      WebSettingType.StickyHeaderLogo,
      WebSettingType.QuizZoneIcon,
      WebSettingType.DailyQuizIcon,
      WebSettingType.TrueFalseIcon,
      WebSettingType.FunLearnIcon,
      WebSettingType.QuizzesByLan,
      WebSettingType.SelfChallengeIcon,
      WebSettingType.ContestPlayIcon,
      WebSettingType.OneOneBattleIcon,
      WebSettingType.GroupBattleIcon,
      WebSettingType.AudioQuestionIcon,
      WebSettingType.MathManiaIcon,
      WebSettingType.ExamIcon,
      WebSettingType.GuessTheWordIcon,
    ];

    let cachedSettings = await this.redisService.get<Record<string, string>>(
      CacheKey.WebSetting
    );

    if (!cachedSettings) {
      await this.syncSettingToCache();
      cachedSettings = await this.redisService.get<Record<string, string>>(
        CacheKey.WebSetting
      );
    }

    // const filteredSettings: Record<string, string> = {};
    // for (const key of publicSettings) {
    //   filteredSettings[key] = '';
    //   if (cachedSettings?.[key]) {
    //     filteredSettings[key] = cachedSettings[key];
    //   }
    // }

    return cachedSettings ?? {};
  }

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

    await this.syncSettingToCache();
  }

  async deleteWebSetting(key: string): Promise<void> {
    await this.dbService.connection
      .table(WEB_SETTINGS_SCHEMA.TABLE)
      .where({ type: key })
      .del();
    await this.syncSettingToCache();
  }
}
