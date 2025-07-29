import { Test, TestingModule } from '@nestjs/testing';
import { SubcategoryController } from './subcategory.controller';
import { SubcategoryService } from './subcategory.service';

describe('SubcategoryController', () => {
  let controller: SubcategoryController;
  let service: SubcategoryService;

  const mockSubcategoryService = {
    getSubcategoryDetail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubcategoryController],
      providers: [
        {
          provide: SubcategoryService,
          useValue: mockSubcategoryService,
        },
      ],
    }).compile();

    controller = module.get<SubcategoryController>(SubcategoryController);
    service = module.get<SubcategoryService>(SubcategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubcategoryDetailGet', () => {
    it('should call service with GET query params and return data', async () => {
      const mockResult = { id: 21, name: 'Personal Finance' };
      mockSubcategoryService.getSubcategoryDetail.mockResolvedValueOnce(mockResult);

      const result = await controller.getSubcategoryDetailGet(21, 14, 'personal-finance');
      expect(service.getSubcategoryDetail).toHaveBeenCalledWith({
        id: 21,
        languageId: 14,
        slug: 'personal-finance',
      });
      expect(result).toEqual({ error: false, data: mockResult });
    });
  });

  describe('getSubcategoryDetailPost', () => {
    it('should call service with POST body and return data', async () => {
      const mockResult = { id: 21, name: 'Personal Finance' };
      mockSubcategoryService.getSubcategoryDetail.mockResolvedValueOnce(mockResult);

      const postData = {
        id: 21,
        language_id: 14,
        slug_subcategory: 'personal-finance',
      };

      const result = await controller.getSubcategoryDetailPost(postData);
      expect(service.getSubcategoryDetail).toHaveBeenCalledWith({
        id: 21,
        languageId: 14,
        slug: 'personal-finance',
      });
      expect(result).toEqual({ error: false, data: mockResult });
    });

    it('should handle optional fields gracefully', async () => {
      const mockResult = { id: 3, name: 'History' };
      mockSubcategoryService.getSubcategoryDetail.mockResolvedValueOnce(mockResult);

      const result = await controller.getSubcategoryDetailPost({});
      expect(service.getSubcategoryDetail).toHaveBeenCalledWith({
        id: undefined,
        languageId: undefined,
        slug: undefined,
      });
      expect(result).toEqual({ error: false, data: mockResult });
    });
  });
});
