import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getDashboardCounts: jest.fn(),
    getUserStatistics: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardCounts', () => {
    it('should return dashboard counts with correct response format', async () => {
      const mockResponse = {
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

      mockDashboardService.getDashboardCounts.mockResolvedValueOnce(
        mockResponse
      );
      const result = await controller.getDashboardCounts({ syncNow: false });

      expect(service.getDashboardCounts).toHaveBeenCalledWith(false);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getUserStats', () => {
    it('should return monthly stats with correct response format', async () => {
      const mockResponse = {
        error: false,
        data: [
          { month_name: 'January', user_count: 100 },
          { month_name: 'February', user_count: 150 },
        ],
      };

      mockDashboardService.getUserStatistics.mockResolvedValueOnce(
        mockResponse
      );

      const result = await controller.getUserStats({
        filterType: 'month',
        syncNow: false,
      });

      expect(service.getUserStatistics).toHaveBeenCalledWith('month', false);
      expect(result).toEqual(mockResponse);
    });

    it('should return weekly stats with correct response format', async () => {
      const mockResponse = {
        error: false,
        data: [
          { day_name: 'Monday', user_count: 20 },
          { day_name: 'Tuesday', user_count: 25 },
        ],
      };

      mockDashboardService.getUserStatistics.mockResolvedValueOnce(
        mockResponse
      );

      const result = await controller.getUserStats({
        filterType: 'week',
        syncNow: false,
      });

      expect(service.getUserStatistics).toHaveBeenCalledWith('week', false);
      expect(result).toEqual(mockResponse);
    });

    it('should return daily stats with correct response format', async () => {
      const mockResponse = {
        error: false,
        data: [
          { day_name: '1', user_count: 10 },
          { day_name: '2', user_count: 15 },
        ],
      };

      mockDashboardService.getUserStatistics.mockResolvedValueOnce(
        mockResponse
      );

      const result = await controller.getUserStats({
        filterType: 'day',
        syncNow: false,
      });

      expect(service.getUserStatistics).toHaveBeenCalledWith('day', false);
      expect(result).toEqual(mockResponse);
    });
  });
});
