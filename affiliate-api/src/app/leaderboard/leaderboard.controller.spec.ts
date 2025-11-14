import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardController } from './leaderboard.controller';
import { LeaderboardService } from './leaderboard.service';
import { AuthGuard } from '../auth/auth.guard';
import {
  DashboardResponseDto,
  LeaderboardQueryDto,
  LeaderboardResponseDto
} from './dto';

describe('LeaderboardController', () => {
  let controller: LeaderboardController;
  let service: LeaderboardService;

  const mockLeaderboardService = {
    getUserDashboard: jest.fn(),
    getMonthlyLeaderboard: jest.fn(),
    getAllTimeLeaderboard: jest.fn()
  };

  const mockAuthGuard = {
    canActivate: jest.fn(() => true)
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaderboardController],
      providers: [
        {
          provide: LeaderboardService,
          useValue: mockLeaderboardService
        }
      ]
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    controller = module.get<LeaderboardController>(LeaderboardController);
    service = module.get<LeaderboardService>(LeaderboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should return user dashboard data', async () => {
      const mockUser = { id: 1, projectId: 1 };
      const mockDashboard: DashboardResponseDto = {
        rank: {
          rank: 15,
          percentile: 8.5,
          display: '#15',
          percentileDisplay: 'Top 8.5% of affiliates'
        },
        referrals: {
          total: 142,
          weeklyChange: 5,
          weeklyChangeDisplay: '+5 this week'
        },
        conversions: {
          total: 87,
          conversionRate: 61.27,
          conversionRateDisplay: '61.27%'
        },
        earnings: {
          total: 3456.78,
          monthlyChange: 250,
          totalDisplay: '$3,456.78',
          monthlyChangeDisplay: '+$250.00 this month'
        }
      };

      jest.spyOn(service, 'getUserDashboard').mockResolvedValue(mockDashboard);

      const result = await controller.getDashboard(mockUser);

      expect(result).toEqual(mockDashboard);
      expect(service.getUserDashboard).toHaveBeenCalledWith(1, 1);
    });

    it('should be protected by AuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', controller.getDashboard);
      expect(guards).toBeDefined();
      expect(guards).toContain(AuthGuard);
    });
  });

  describe('getMonthlyLeaderboard', () => {
    it('should return monthly leaderboard with default parameters', async () => {
      const mockUser = { projectId: 1 };
      const query: LeaderboardQueryDto = {};
      const mockLeaderboard: LeaderboardResponseDto = {
        data: [
          {
            rank: 1,
            affiliateId: 123,
            name: 'CryptoKing',
            address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
            totalReferrals: 245,
            totalConversions: 189,
            earnings: 8765.43,
            status: 'Active',
            earningsDisplay: '$8,765.43'
          }
        ],
        meta: {
          currentPage: 1,
          limit: 100,
          totalPages: 5,
          total: 456,
          hasNextPage: true,
          hasPrevPage: false,
          nextPage: 2,
          prevPage: null,
          period: 'monthly',
          year: 2025,
          month: 11
        }
      };

      jest.spyOn(service, 'getMonthlyLeaderboard').mockResolvedValue(mockLeaderboard);

      const result = await controller.getMonthlyLeaderboard(mockUser, query);

      expect(result).toEqual(mockLeaderboard);
      expect(service.getMonthlyLeaderboard).toHaveBeenCalledWith(1, query);
    });

    it('should return monthly leaderboard with custom parameters', async () => {
      const mockUser = { projectId: 1 };
      const query: LeaderboardQueryDto = {
        page: 2,
        limit: 50,
        year: 2024,
        month: 10
      };
      const mockLeaderboard: LeaderboardResponseDto = {
        data: [],
        meta: {
          currentPage: 2,
          limit: 50,
          totalPages: 3,
          total: 120,
          hasNextPage: true,
          hasPrevPage: true,
          nextPage: 3,
          prevPage: 1,
          period: 'monthly',
          year: 2024,
          month: 10
        }
      };

      jest.spyOn(service, 'getMonthlyLeaderboard').mockResolvedValue(mockLeaderboard);

      const result = await controller.getMonthlyLeaderboard(mockUser, query);

      expect(result).toEqual(mockLeaderboard);
      expect(service.getMonthlyLeaderboard).toHaveBeenCalledWith(1, query);
    });

    it('should be protected by AuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', controller.getMonthlyLeaderboard);
      expect(guards).toBeDefined();
      expect(guards).toContain(AuthGuard);
    });
  });

  describe('getAllTimeLeaderboard', () => {
    it('should return all-time leaderboard with default parameters', async () => {
      const mockUser = { projectId: 1 };
      const query: LeaderboardQueryDto = {};
      const mockLeaderboard: LeaderboardResponseDto = {
        data: [
          {
            rank: 1,
            affiliateId: 456,
            name: 'TopAffiliate',
            address: '0x123abc',
            totalReferrals: 1500,
            totalConversions: 1200,
            earnings: 50000.00,
            status: 'Active',
            earningsDisplay: '$50,000.00'
          },
          {
            rank: 2,
            affiliateId: 789,
            name: 'SecondPlace',
            address: '0x456def',
            totalReferrals: 1200,
            totalConversions: 950,
            earnings: 42000.00,
            status: 'Active',
            earningsDisplay: '$42,000.00'
          }
        ],
        meta: {
          currentPage: 1,
          limit: 100,
          totalPages: 10,
          total: 987,
          hasNextPage: true,
          hasPrevPage: false,
          nextPage: 2,
          prevPage: null,
          period: 'all-time',
          year: null,
          month: null
        }
      };

      jest.spyOn(service, 'getAllTimeLeaderboard').mockResolvedValue(mockLeaderboard);

      const result = await controller.getAllTimeLeaderboard(mockUser, query);

      expect(result).toEqual(mockLeaderboard);
      expect(service.getAllTimeLeaderboard).toHaveBeenCalledWith(1, query);
    });

    it('should return all-time leaderboard with pagination', async () => {
      const mockUser = { projectId: 1 };
      const query: LeaderboardQueryDto = {
        page: 3,
        limit: 100
      };
      const mockLeaderboard: LeaderboardResponseDto = {
        data: [],
        meta: {
          currentPage: 3,
          limit: 100,
          totalPages: 5,
          total: 456,
          hasNextPage: true,
          hasPrevPage: true,
          nextPage: 4,
          prevPage: 2,
          period: 'all-time',
          year: null,
          month: null
        }
      };

      jest.spyOn(service, 'getAllTimeLeaderboard').mockResolvedValue(mockLeaderboard);

      const result = await controller.getAllTimeLeaderboard(mockUser, query);

      expect(result).toEqual(mockLeaderboard);
      expect(service.getAllTimeLeaderboard).toHaveBeenCalledWith(1, query);
      expect(result.meta.currentPage).toBe(3);
      expect(result.meta.hasPrevPage).toBe(true);
    });

    it('should be protected by AuthGuard', () => {
      const guards = Reflect.getMetadata('__guards__', controller.getAllTimeLeaderboard);
      expect(guards).toBeDefined();
      expect(guards).toContain(AuthGuard);
    });
  });

  describe('error handling', () => {
    it('should handle service errors for dashboard', async () => {
      const mockUser = { id: 999, projectId: 1 };
      const error = new Error('User not found');

      jest.spyOn(service, 'getUserDashboard').mockRejectedValue(error);

      await expect(controller.getDashboard(mockUser)).rejects.toThrow('User not found');
    });

    it('should handle service errors for monthly leaderboard', async () => {
      const mockUser = { projectId: 1 };
      const query: LeaderboardQueryDto = { page: 1, limit: 100 };
      const error = new Error('Database error');

      jest.spyOn(service, 'getMonthlyLeaderboard').mockRejectedValue(error);

      await expect(controller.getMonthlyLeaderboard(mockUser, query)).rejects.toThrow('Database error');
    });

    it('should handle service errors for all-time leaderboard', async () => {
      const mockUser = { projectId: 1 };
      const query: LeaderboardQueryDto = { page: 1, limit: 100 };
      const error = new Error('Database error');

      jest.spyOn(service, 'getAllTimeLeaderboard').mockRejectedValue(error);

      await expect(controller.getAllTimeLeaderboard(mockUser, query)).rejects.toThrow('Database error');
    });
  });

  describe('metadata validation', () => {
    it('should have proper API tags', () => {
      const apiTags = Reflect.getMetadata('swagger/apiUseTags', LeaderboardController);
      expect(apiTags).toContain('Leaderboard');
    });

    it('should have bearer auth applied', () => {
      const bearerAuth = Reflect.getMetadata('swagger/apiSecurity', LeaderboardController);
      expect(bearerAuth).toBeDefined();
    });
  });
});
