import { Test, TestingModule } from '@nestjs/testing';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';

describe('CategoryController', () => {
  let controller: CategoryController;
  let service: CategoryService;

  const mockCategoryService = {
    getCategoryDetail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoryController],
      providers: [
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    }).compile();

    controller = module.get<CategoryController>(CategoryController);
    service = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategoryDetailGet', () => {
    it('should call service with GET query params and return data', async () => {
      const mockResult = { id: 1, name: 'Math' };
      mockCategoryService.getCategoryDetail.mockResolvedValueOnce(mockResult);

      const result = await controller.getCategoryDetailGet(1, 2, 'math');
      expect(service.getCategoryDetail).toHaveBeenCalledWith({
        id: 1,
        languageId: 2,
        slug: 'math',
      });
      expect(result).toEqual({ error: false, data: mockResult });
    });
  });

  describe('getCategoryDetailPost', () => {
    it('should call service with POST body and return data', async () => {
      const mockResult = { id: 2, name: 'English' };
      mockCategoryService.getCategoryDetail.mockResolvedValueOnce(mockResult);

      const postData = {
        id: 2,
        language_id: 1,
        slug_category: 'english',
      };

      const result = await controller.getCategoryDetailPost(postData);
      expect(service.getCategoryDetail).toHaveBeenCalledWith({
        id: 2,
        languageId: 1,
        slug: 'english',
      });
      expect(result).toEqual({ error: false, data: mockResult });
    });

    it('should handle optional fields gracefully', async () => {
      const mockResult = { id: 3, name: 'History' };
      mockCategoryService.getCategoryDetail.mockResolvedValueOnce(mockResult);

      const result = await controller.getCategoryDetailPost({});
      expect(service.getCategoryDetail).toHaveBeenCalledWith({
        id: undefined,
        languageId: undefined,
        slug: undefined,
      });
      expect(result).toEqual({ error: false, data: mockResult });
    });
  });
});
