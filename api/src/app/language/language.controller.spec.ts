import { Test, TestingModule } from '@nestjs/testing';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';

describe('LanguageController', () => {
  let controller: LanguageController;
  let service: LanguageService;

  const mockLanguageService = {
    createLanguage: jest.fn(),
    editLanguage: jest.fn(),
    getAllLanguages: jest.fn(),
    deleteLanguages: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguageController],
      providers: [
        {
          provide: LanguageService,
          useValue: mockLanguageService,
        },
      ],
    }).compile();

    controller = module.get<LanguageController>(LanguageController);
    service = module.get<LanguageService>(LanguageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLanguage', () => {
    it('should create a new language successfully', async () => {
      const createDto = {
        language: 'English',
        code: 'en',
        status: 1,
        type: 1,
      };
      const mockResult = {
        error: false,
        message: 'Language created successfully',
        data: { id: 1, ...createDto },
      };

      mockLanguageService.createLanguage.mockResolvedValueOnce(mockResult);

      const result = await controller.createLanguage(createDto);
      expect(service.createLanguage).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('editLanguage', () => {
    it('should edit language successfully', async () => {
      const editDto = {
        language: 'English Updated',
        code: 'en',
        status: 0,
        type: 0,
      };
      const languageId = 1;
      const mockResult = {
        error: false,
        message: 'Language updated successfully',
        data: { id: languageId, ...editDto },
      };

      mockLanguageService.editLanguage.mockResolvedValueOnce(mockResult);

      const result = await controller.editLanguage(languageId, editDto);
      expect(service.editLanguage).toHaveBeenCalledWith(languageId, editDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('getAllLanguages', () => {
    it('should return all languages with pagination', async () => {
      const query = {
        limit: 10,
        offset: 0,
        search: 'eng',
        sortBy: 'id',
        order: 'DESC',
        status: 1,
        type: 1,
      };
      const mockResult = {
        error: false,
        data: {
          languages: [
            { id: 1, language: 'English', code: 'en', status: 1, type: 1 },
          ],
          total: 1,
        },
      };

      mockLanguageService.getAllLanguages.mockResolvedValueOnce(mockResult);

      const result = await controller.getAllLanguages(query);
      expect(service.getAllLanguages).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockResult);
    });
  });

  describe('deleteLanguages', () => {
    it('should delete languages successfully', async () => {
      const ids = { ids: [1, 2] };
      const mockResult = {
        error: false,
        message: 'Languages deleted successfully',
        data: { deleted: [1, 2], missing: [] },
      };

      mockLanguageService.deleteLanguages.mockResolvedValueOnce(mockResult);

      const result = await controller.deleteLanguages(ids);
      expect(service.deleteLanguages).toHaveBeenCalledWith(ids.ids);
      expect(result).toEqual(mockResult);
    });
  });
});
