import { Test, TestingModule } from '@nestjs/testing';
import { SubcategoryService } from './subcategory.service';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { WebSeoService } from './../web-seo/web-seo.service';

describe('SubcategoryService', () => {
  let service: SubcategoryService;
  let redisService: RedisService;

  const mockDbService = {
    connection: {
      table: jest.fn(),
      raw: jest.fn((sql) => sql), // Mock raw SQL execution
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const mockWebSeoService = {
    addWebSeoJoin: jest.fn(),
    getWebSeoSelectQuery: jest.fn().mockReturnValue('web_seo'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubcategoryService,
        { provide: DatabaseService, useValue: mockDbService },
        { provide: RedisService, useValue: mockRedisService },
        { provide: WebSeoService, useValue: mockWebSeoService },
      ],
    }).compile();

    service = module.get<SubcategoryService>(SubcategoryService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubcategoryDetail', () => {
    it('should return null if id and slug are missing', async () => {
      const result = await service.getSubcategoryDetail({ languageId: 1 });
      expect(result).toBeNull();
    });

    it('should return cached data if available', async () => {
      const mockData = { id: 1, name: 'Mock Subcategory' };
      redisService.get.mockResolvedValueOnce(mockData);

      const result = await service.getSubcategoryDetail({ id: 1, languageId: 2 });
      expect(redisService.get).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should query DB and cache data if not found in cache', async () => {
      redisService.get.mockResolvedValueOnce(null);

      const mockQuery = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        first: jest.fn().mockResolvedValue({
          id: 1,
          slug: 'subcategory-slug',
          image: 'cat.jpg',
          no_of_que: 10,
          maxlevel: 3,
          web_seo: JSON.stringify({ title: 'SEO Title' }),
        }),
      };

      const mockFaq = [{ question: 'FAQ 1' }];
      mockDbService.connection.table
        .mockImplementationOnce(() => mockQuery) // subcategory query
        .mockImplementationOnce(() => ({ where: jest.fn().mockResolvedValue(mockFaq) })); // faq query

      const result = await service.getSubcategoryDetail({ id: 1, languageId: 14 });

      expect(redisService.set).toHaveBeenCalledTimes(2);
      expect(result).toHaveProperty('faq');
      expect(result).toHaveProperty('share_url');
      expect(result.image).toContain('/subcategory/');
      expect(result.thumb_image).toContain('/subcategory/thumbs/');
    });

    it('should return null and log error if query throws', async () => {
      redisService.get.mockResolvedValueOnce(null);
      mockDbService.connection.table.mockImplementation(() => {
        throw new Error('DB error');
      });

      const result = await service.getSubcategoryDetail({ id: 99, languageId: 1 });
      expect(result).toBeNull();
    });
  });
});
