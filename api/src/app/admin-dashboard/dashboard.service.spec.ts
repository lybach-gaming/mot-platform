import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let dbService: DatabaseService;
  let redisService: RedisService;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    whereIn: jest.fn().mockReturnThis(),
    whereRaw: jest.fn().mockReturnThis(),
    andWhereRaw: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    orderByRaw: jest.fn().mockReturnThis(),
    groupByRaw: jest.fn().mockReturnThis(),
    first: jest.fn(),
    count: jest.fn(),
  };

  const mockDbService = {
    connection: {
      transaction: jest.fn(() => ({
        ...mockQueryBuilder,
        commit: jest.fn(),
        rollback: jest.fn(),
      })),
      table: jest.fn(() => mockQueryBuilder),
      raw: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
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

    service = module.get<DashboardService>(DashboardService);
    dbService = module.get<DatabaseService>(DatabaseService);
    redisService = module.get<RedisService>(RedisService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardCounts', () => {
    it('should return counts from cache when available', async () => {
      const cachedData = {
        error: false,
        data: [
          {
            languages: 5,
            categories: 10,
            subcategories: 20,
            subcategoryLevels: 30,
            quizzes: 100,
            questions: 500,
            liveContests: 2,
            funAndLearn: 30,
            guessTheWord: 45,
            allUsers: 1000,
            systemUsers: 15,
          },
        ],
      };

      mockRedisService.get.mockResolvedValueOnce(JSON.stringify(cachedData));

      const result = await service.getDashboardCounts(false);
      expect(result).toEqual(cachedData);
      expect(mockDbService.connection.table).not.toHaveBeenCalled();
    });

    it('should fetch fresh counts when syncNow is true', async () => {
      mockQueryBuilder.count.mockResolvedValue([{ count: '10' }]);
      mockQueryBuilder.first.mockResolvedValue({ count: '10' });

      const result = await service.getDashboardCounts(true);

      expect(result.error).toBeFalsy();
      expect(Array.isArray(result.data)).toBeTruthy();
      expect(mockRedisService.set).toHaveBeenCalled();
    });
  });

  describe('getUserStatistics', () => {
    it('should return monthly stats from cache when available', async () => {
      const cachedData = {
        error: false,
        data: [
          { month_name: 'January', user_count: 100 },
          { month_name: 'February', user_count: 150 },
        ],
      };

      mockRedisService.get.mockResolvedValueOnce(JSON.stringify(cachedData));

      const result = await service.getUserStatistics('month', false);
      expect(result).toEqual(cachedData);
    });

    it('should fetch fresh monthly stats when syncNow is true', async () => {
      const monthlyData = [
        { month_name: 'January', user_count: 100 },
        { month_name: 'February', user_count: 150 },
      ];

      mockDbService.connection.raw.mockResolvedValueOnce([monthlyData]);

      const result = await service.getUserStatistics('month', true);
      expect(result.error).toBeFalsy();
      expect(Array.isArray(result.data)).toBeTruthy();
      expect(mockRedisService.set).toHaveBeenCalled();
    });

    it('should fetch fresh weekly stats with correct format', async () => {
      const weeklyData = [
        { day_name: 'Monday', user_count: 20 },
        { day_name: 'Tuesday', user_count: 25 },
      ];

      mockDbService.connection.raw.mockResolvedValueOnce([weeklyData]);

      const result = await service.getUserStatistics('week', true);
      expect(result.error).toBeFalsy();
      expect(Array.isArray(result.data)).toBeTruthy();
      expect(result.data[0]).toHaveProperty('day_name');
      expect(result.data[0]).toHaveProperty('user_count');
    });

    it('should fetch fresh daily stats with correct format', async () => {
      const dailyData = [
        { day_name: '1', user_count: 10 },
        { day_name: '2', user_count: 15 },
      ];

      mockDbService.connection.raw.mockResolvedValueOnce([dailyData]);

      const result = await service.getUserStatistics('day', true);
      expect(result.error).toBeFalsy();
      expect(Array.isArray(result.data)).toBeTruthy();
      expect(result.data[0]).toHaveProperty('day_name');
      expect(result.data[0]).toHaveProperty('user_count');
    });
  });
});
