import { Test, TestingModule } from '@nestjs/testing';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

describe('SettingController', () => {
  let controller: SettingController;

  const mockSettingService = {
    getAllWebSetting: jest.fn(),
    getPublicWebSetting: jest.fn(),
    setWebSetting: jest.fn(),
    deleteWebSetting: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SettingController],
      providers: [
        {
          provide: SettingService,
          useValue: mockSettingService,
        },
      ],
    }).compile();

    controller = module.get<SettingController>(SettingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllWebSettings', () => {
    it('should return all web settings', async () => {
      const mockSettings = { key: 'value' };
      mockSettingService.getAllWebSetting.mockResolvedValue(mockSettings);

      const result = await controller.getAllWebSettings();

      expect(result).toEqual(mockSettings);
      expect(mockSettingService.getAllWebSetting).toHaveBeenCalled();
    });
  });

  describe('getPublicWebSettings', () => {
    it('should return public web settings', async () => {
      const mockSettings = { key: 'value' };
      mockSettingService.getPublicWebSetting.mockResolvedValue(mockSettings);

      const result = await controller.getPublicWebSettings();

      expect(result).toEqual(mockSettings);
      expect(mockSettingService.getPublicWebSetting).toHaveBeenCalled();
    });
  });

  describe('updateWebSetting', () => {
    it('should update web setting', async () => {
      const key = 'test';
      const value = 'value';

      await controller.updateWebSetting(key, value);

      expect(mockSettingService.setWebSetting).toHaveBeenCalledWith(key, value);
    });
  });

  describe('deleteWebSetting', () => {
    it('should delete web setting', async () => {
      const key = 'test';

      await controller.deleteWebSetting(key);

      expect(mockSettingService.deleteWebSetting).toHaveBeenCalledWith(key);
    });
  });
});
