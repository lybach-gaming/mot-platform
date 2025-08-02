import { Test, TestingModule } from '@nestjs/testing';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

describe('SettingController', () => {
  let controller: SettingController;

  const mockSettingService = {
    getPublicWebSetting: jest.fn(),
    getSetting: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingController],
      providers: [{ provide: SettingService, useValue: mockSettingService }],
    }).compile();

    controller = module.get<SettingController>(SettingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWebSettingGet', () => {
    it('should return web settings via GET', async () => {
      const mockData = { foo: 'bar' };
      mockSettingService.getPublicWebSetting.mockResolvedValueOnce(mockData);

      const result = await controller.getWebSettingGet();
      expect(result).toEqual({ error: false, data: mockData });
      expect(mockSettingService.getPublicWebSetting).toHaveBeenCalled();
    });
  });

  describe('getWebSettingPost', () => {
    it('should return web settings via POST', async () => {
      const mockData = { foo: 'bar' };
      mockSettingService.getPublicWebSetting.mockResolvedValueOnce(mockData);

      const result = await controller.getWebSettingPost();
      expect(result).toEqual({ error: false, data: mockData });
      expect(mockSettingService.getPublicWebSetting).toHaveBeenCalled();
    });
  });

  describe('getSettingGet', () => {
    it('should return setting with type query param', async () => {
      const mockData = { type: 'about_us', message: 'Hello' };
      mockSettingService.getSetting.mockResolvedValueOnce(mockData);

      const result = await controller.getSettingGet('about_us');
      expect(result).toEqual({ error: false, data: mockData });
      expect(mockSettingService.getSetting).toHaveBeenCalledWith({
        type: 'about_us',
      });
    });

    it('should return all settings when no type provided', async () => {
      const mockData = [{ type: 'a' }, { type: 'b' }];
      mockSettingService.getSetting.mockResolvedValueOnce(mockData);

      const result = await controller.getSettingGet(undefined);
      expect(result).toEqual({ error: false, data: mockData });
      expect(mockSettingService.getSetting).toHaveBeenCalledWith({
        type: undefined,
      });
    });
  });

  describe('getSettingPost', () => {
    it('should return setting with type in body', async () => {
      const mockData = { type: 'contact_us', message: 'Hi' };
      mockSettingService.getSetting.mockResolvedValueOnce(mockData);

      const result = await controller.getSettingPost({ type: 'contact_us' });
      expect(result).toEqual({ error: false, data: mockData });
      expect(mockSettingService.getSetting).toHaveBeenCalledWith({
        type: 'contact_us',
      });
    });
  });
});
