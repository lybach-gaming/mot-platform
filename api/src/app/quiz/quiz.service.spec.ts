import { Test, TestingModule } from '@nestjs/testing';
import { QUIZZES_IMG_PATH } from '../../common/constants/app';
import { CacheKey } from '../../common/constants/cache-key';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { QuizService } from './quiz.service';

describe('QuizService', () => {
  let service: QuizService;

  const mockDbService = {
    connection: {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      first: jest.fn(),
      count: jest.fn().mockReturnThis(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
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

    service = module.get<QuizService>(QuizService);
  });

  describe('getDetailQuizzes', () => {
    it('should return error if slug and id are missing', async () => {
      const result = await service.getDetailQuizzes({});
      expect(result).toEqual({
        error: true,
        message: '103',
        msg: 'slug_quizzes is required!',
        data: null,
      });
    });

    it('should return cached data if exists', async () => {
      const cachedData = { error: false, data: { quizz_name: 'Cached Quiz' } };
      mockRedisService.get.mockResolvedValue(cachedData);

      const result = await service.getDetailQuizzes({
        slug_quizzes: 'test-quiz',
      });

      expect(mockRedisService.get).toHaveBeenCalledWith(
        `${CacheKey.GetDetailQuizzes}${JSON.stringify({
          slug_quizzes: 'test-quiz',
        })}`
      );
      expect(result).toEqual(cachedData);
      expect(mockDbService.connection.from).not.toHaveBeenCalled();
    });

    it('should fetch quiz details from DB and map slugs, images, seo, faq', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockDbService.connection.first
        .mockResolvedValueOnce({
          id: 1,
          slug: 'test-quiz',
          image: 'quiz.png',
          maincat_id: 10,
          main_subcat_id: 20,
          main_subcat_level_id: 30,
          language_id: 14,
        }) // quiz data
        .mockResolvedValueOnce({ slug: 'category-slug' }) // category slug
        .mockResolvedValueOnce({ slug: 'subcategory-slug' }) // subcategory slug
        .mockResolvedValueOnce({ slug: 'level-slug' }) // level slug
        .mockResolvedValueOnce({ seo: 'seo-data' }); // web_seo
      mockDbService.connection.select.mockResolvedValue([{ faq: 'faq1' }]); // faq
      mockDbService.connection.count.mockResolvedValueOnce({ count: 10 }); // no_of_que
      mockDbService.connection.first.mockResolvedValueOnce({}); // is_played
      mockDbService.connection.count.mockResolvedValueOnce({ count: 1 }); // completed

      const result = await service.getDetailQuizzes({
        slug_quizzes: 'test-quiz',
        userId: 123,
      });

      expect(result.error).toBe(false);
      expect(result.data.slug_category).toBe('category-slug');
      expect(result.data.slug_subcategory).toBe('subcategory-slug');
      expect(result.data.slug_subcategory_level).toBe('level-slug');
      expect(result.data.image).toContain(QUIZZES_IMG_PATH);
      expect(result.data.web_seo).toBeDefined();
      expect(result.data.faq.length).toBeGreaterThan(0);
      expect(result.data.no_of_que).toBe(10);
      expect(result.data.is_played).toBe(true);
      expect(result.data.completed).toBe(true);
    });

    it('should return error if quiz not found', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockDbService.connection.first.mockResolvedValue(null);

      const result = await service.getDetailQuizzes({
        slug_quizzes: 'nonexistent',
      });

      expect(result).toEqual({
        error: true,
        message: 'Quiz not found',
        data: null,
      });
    });

    it('should handle database error gracefully', async () => {
      mockRedisService.get.mockResolvedValue(null);
      mockDbService.connection.first.mockRejectedValue(new Error('DB error'));

      await expect(
        service.getDetailQuizzes({ slug_quizzes: 'test-quiz' })
      ).rejects.toThrow('DB error');
    });

    it('should handle redis error gracefully', async () => {
      mockRedisService.get.mockRejectedValue(new Error('Redis error'));
      mockDbService.connection.first.mockResolvedValue(null);

      await expect(
        service.getDetailQuizzes({ slug_quizzes: 'test-quiz' })
      ).rejects.toThrow('Redis error');
    });
  });
});
