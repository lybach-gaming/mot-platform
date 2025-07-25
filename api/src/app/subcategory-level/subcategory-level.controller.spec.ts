import { Test, TestingModule } from '@nestjs/testing';
import { SubcategoryLevelController } from './subcategory-level.controller';
import { SubcategoryLevelService } from './subcategory-level.service';

describe('SubcategoryLevelController', () => {
  let controller: SubcategoryLevelController;
  let service: SubcategoryLevelService;

  const mockSubcategoryLevelService = {
    getSubcategoryLevelDetail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubcategoryLevelController],
      providers: [
        {
          provide: SubcategoryLevelService,
          useValue: mockSubcategoryLevelService,
        },
      ],
    }).compile();

    controller = module.get<SubcategoryLevelController>(SubcategoryLevelController);
    service = module.get<SubcategoryLevelService>(SubcategoryLevelService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubcategoryLevelDetailGet', () => {
    it('should call service with GET query params and return data', async () => {
      const mockResult = { id: 26, name: 'Personal Finance Topics' };
      mockSubcategoryLevelService.getSubcategoryLevelDetail.mockResolvedValueOnce(mockResult);

      const result = await controller.getSubcategoryLevelDetailGet(26, 14, 'persfin-topics');
      expect(service.getSubcategoryLevelDetail).toHaveBeenCalledWith({
        id: 26,
        languageId: 14,
        slug: 'persfin-topics',
      });
      expect(result).toEqual({ error: false, data: mockResult });
    });
  });

  describe('getSubcategoryLevelDetailPost', () => {
    it('should call service with POST body and return data', async () => {
      const mockResult = { id: 26, name: 'Personal Finance Topics' };
      mockSubcategoryLevelService.getSubcategoryLevelDetail.mockResolvedValueOnce(mockResult);

      const postData = {
        id: 26,
        language_id: 14,
        slug_subcategory_level: 'persfin-topics',
      };

      const result = await controller.getSubcategoryLevelDetailPost(postData);
      expect(service.getSubcategoryLevelDetail).toHaveBeenCalledWith({
        id: 26,
        languageId: 14,
        slug: 'persfin-topics',
      });
      expect(result).toEqual({ error: false, data: mockResult });
    });

    it('should handle optional fields gracefully', async () => {
      const mockResult = { id: 3, name: 'History' };
      mockSubcategoryLevelService.getSubcategoryLevelDetail.mockResolvedValueOnce(mockResult);

      const result = await controller.getSubcategoryLevelDetailPost({});
      expect(service.getSubcategoryLevelDetail).toHaveBeenCalledWith({
        id: undefined,
        languageId: undefined,
        slug: undefined,
      });
      expect(result).toEqual({ error: false, data: mockResult });
    });
  });
});
