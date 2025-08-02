import { Test, TestingModule } from '@nestjs/testing';
import { SettingService } from './setting.service';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';

describe('SettingService', () => {
  let service: SettingService;
  let dbService: DatabaseService;
  let redisService: RedisService;

  const mockDbRows = [
    { type: 'site_title', message: 'My Website' },
    { type: 'logo', message: 'logo.png' },
  ];

  beforeEach(async () => {
    dbService = {
      connection: {
        table: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({ message: 'value' }),
        select: jest.fn().mockResolvedValue(mockDbRows),
      },
    };

    redisService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingService,
        { provide: DatabaseService, useValue: dbService },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get<SettingService>(SettingService);
  });

  describe('getPublicWebSetting', () => {
    it('should return data from cache if exists', async () => {
      redisService.get.mockResolvedValueOnce({ logo: 'logo.png' });
      const result = await service.getPublicWebSetting();
      expect(result).toEqual({ logo: 'logo.png' });
    });

    it('should call syncWebSettingToCache if no cache', async () => {
      redisService.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ title: 'Website' });
      const result = await service.getPublicWebSetting();
      expect(redisService.set).toHaveBeenCalled();
      expect(result).toEqual({ title: 'Website' });
    });
  });

  describe('getSetting', () => {
    it('should return cached value if type exists in cache', async () => {
      redisService.get.mockResolvedValueOnce({ site_title: 'My Website' });
      const result = await service.getSetting({ type: 'site_title' });
      expect(result).toBe('My Website');
    });

    it('should fetch from db and call syncSettingToCache if not cached', async () => {
      redisService.get.mockResolvedValueOnce(null);
      const result = await service.getSetting({ type: 'site_title' });
      expect(redisService.set).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('getAllWebSetting', () => {
    it('should return data from cache if available', async () => {
      redisService.get.mockResolvedValueOnce({ site_title: 'My Website' });
      const result = await service.getAllWebSetting();
      expect(result).toEqual({ site_title: 'My Website' });
    });

    it('should sync cache and return data if cache is empty', async () => {
      redisService.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ logo: 'logo.png' });
      const result = await service.getAllWebSetting();
      expect(redisService.set).toHaveBeenCalled();
      expect(result).toEqual({ logo: 'logo.png' });
    });
  });

  describe('getWebSetting', () => {
    it('should return value from cache if available', async () => {
      redisService.get.mockResolvedValueOnce({ logo: 'logo.png' });
      const result = await service.getWebSetting('logo');
      expect(result).toEqual('logo.png');
    });

    it('should fetch from db and return value if not cached', async () => {
      redisService.get.mockResolvedValueOnce(null);
      dbService.connection.first.mockResolvedValueOnce({ value: 'logo.png' });
      const result = await service.getWebSetting('logo');
      expect(redisService.set).toHaveBeenCalled();
      expect(result).toEqual('logo.png');
    });
  });

  describe('findAllSetting', () => {
    it('should return cached settings if available', async () => {
      redisService.get.mockResolvedValueOnce({ a: '1', b: '2' });
      const result = await service.findAllSetting();
      expect(result).toEqual({ a: '1', b: '2' });
    });

    it('should sync cache and return if empty', async () => {
      redisService.get
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ a: '1' });
      const result = await service.findAllSetting();
      expect(redisService.set).toHaveBeenCalled();
      expect(result).toEqual({ a: '1' });
    });
  });
});
