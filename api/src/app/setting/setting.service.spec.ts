import { Test, TestingModule } from '@nestjs/testing';
import { SettingService } from './setting.service';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { CacheKey } from '../../common/constants/cache-key';
import { WEB_SETTINGS_SCHEMA } from '../../core/database/schemas/web-settings.schema';
import { LOGO_TYPES, IMAGE_TYPES } from '../../common/constants/setting-key';

describe('SettingService', () => {
  let service: SettingService;

  const mockDbService = {
    connection: {
      table: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      del: jest.fn(),
      orderBy: jest.fn().mockReturnThis(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingService,
        {
          provide: DatabaseService,
          useValue: mockDbService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<SettingService>(SettingService);
  });

  describe('getWebSetting', () => {
    it('should return cached setting if exists', async () => {
      const mockSettings = { test: 'value' };
      mockRedisService.get.mockResolvedValue(mockSettings);

      const result = await service.getWebSetting('test');

      expect(result).toBe('value');
      expect(mockRedisService.get).toHaveBeenCalledWith(CacheKey.WebSetting);
      expect(mockDbService.connection.table).not.toHaveBeenCalled();
    });

    it('should get setting from DB if not in cache', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockDbService.connection.first.mockResolvedValue({ value: 'dbValue' });

      const result = await service.getWebSetting('test');

      expect(result).toBe('dbValue');
      expect(mockDbService.connection.table).toHaveBeenCalledWith(
        WEB_SETTINGS_SCHEMA.TABLE
      );
      expect(mockDbService.connection.where).toHaveBeenCalledWith({
        type: 'test',
      });
    });

    it('should return null if setting not found', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockDbService.connection.first.mockResolvedValue(null);

      const result = await service.getWebSetting('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAllWebSetting', () => {
    it('should return cached settings if they exist', async () => {
      const mockSettings = { key: 'value' };
      mockRedisService.get.mockResolvedValue(mockSettings);

      const result = await service.getAllWebSetting();

      expect(result).toEqual(mockSettings);
      expect(mockRedisService.get).toHaveBeenCalledWith(CacheKey.WebSetting);
      expect(mockDbService.connection.table).not.toHaveBeenCalled();
    });

    it('should sync and return settings if cache is empty', async () => {
      const mockSettings = { key: 'value' };
      mockRedisService.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockSettings);

      const result = await service.getAllWebSetting();

      expect(result).toEqual(mockSettings);
      expect(mockRedisService.get).toHaveBeenCalledTimes(2);
      expect(mockDbService.connection.table).toHaveBeenCalled();
    });

    it('should return empty object if no settings exist', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockDbService.connection.select.mockResolvedValue([]);

      const result = await service.getAllWebSetting();

      expect(result).toEqual({});
    });
  });

  describe('setWebSetting', () => {
    it('should update existing setting', async () => {
      const key = 'test';
      const value = 'value';
      mockDbService.connection.first.mockResolvedValue({ id: 1 });

      await service.setWebSetting(key, value);

      expect(mockDbService.connection.update).toHaveBeenCalledWith({
        message: value,
      });
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should insert new setting', async () => {
      const key = 'test';
      const value = 'value';
      mockDbService.connection.first.mockResolvedValue(null);

      await service.setWebSetting(key, value);

      expect(mockDbService.connection.insert).toHaveBeenCalledWith({
        type: key,
        message: value,
      });
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should throw error if update fails', async () => {
      mockDbService.connection.first.mockRejectedValue(new Error('DB Error'));

      await expect(service.setWebSetting('test', 'value')).rejects.toThrow(
        'DB Error'
      );
    });
  });

  describe('transformSettingsRows', () => {
    it('should transform logo URLs correctly', () => {
      const rows = [
        { type: LOGO_TYPES[0], message: 'logo.png' },
        { type: 'other_type', message: 'other.png' },
      ];

      const result = service.transformSettingsRows(rows);

      expect(result[LOGO_TYPES[0]]).toContain(WEB_SETTINGS_SCHEMA.LOGO_PATH);
      expect(result.other_type).toBe('other.png');
    });

    it('should transform image URLs correctly', () => {
      const rows = [
        { type: IMAGE_TYPES[0], message: 'image.jpg' },
        { type: 'other_type', message: 'other.jpg' },
      ];

      const result = service.transformSettingsRows(rows);

      expect(result[IMAGE_TYPES[0]]).toContain(WEB_SETTINGS_SCHEMA.IMAGE_PATH);
      expect(result.other_type).toBe('other.jpg');
    });

    it('should handle empty messages', () => {
      const rows = [
        { type: LOGO_TYPES[0], message: '' },
        { type: IMAGE_TYPES[0], message: '' },
      ];

      const result = service.transformSettingsRows(rows);

      expect(result[LOGO_TYPES[0]]).toBe('');
      expect(result[IMAGE_TYPES[0]]).toBe('');
    });
  });

  describe('error handling', () => {
    it('should handle redis errors gracefully', async () => {
      mockRedisService.get.mockRejectedValue(new Error('Redis error'));
      mockDbService.connection.select.mockResolvedValue([
        { type: 'test', message: 'value' },
      ]);

      const result = await service.getAllWebSetting();

      expect(result).toEqual({ test: 'value' });
    });

    it('should handle database errors', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockDbService.connection.select.mockRejectedValue(new Error('DB error'));

      await expect(service.getAllWebSetting()).rejects.toThrow('DB error');
    });
  });
});
