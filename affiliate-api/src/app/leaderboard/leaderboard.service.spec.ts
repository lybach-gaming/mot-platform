import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { AffiliateEntity } from '../affiliate/affiliate.entity';
import { ReferralEntity } from '../referral/referral.entity';
import { PaymentEntity } from '../payment/payment.entity';
import { UserEntity } from '../user/user.entity';
import { CacheService } from '../../shared/cache/cache.service';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let affiliateRepo: Repository<AffiliateEntity>;
  let referralRepo: Repository<ReferralEntity>;
  let paymentRepo: Repository<PaymentEntity>;
  let userRepo: Repository<UserEntity>;
  let cacheService: CacheService;

  const mockQueryBuilder = {
    leftJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    addGroupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    setParameters: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getRawOne: jest.fn(),
    getCount: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        {
          provide: getRepositoryToken(AffiliateEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            count: jest.fn(),
            findOne: jest.fn()
          }
        },
        {
          provide: getRepositoryToken(ReferralEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            count: jest.fn()
          }
        },
        {
          provide: getRepositoryToken(PaymentEntity),
          useValue: {
            createQueryBuilder: jest.fn(() => mockQueryBuilder),
            count: jest.fn()
          }
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn()
          }
        },
        {
          provide: CacheService,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn()
          }
        }
      ]
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
    affiliateRepo = module.get<Repository<AffiliateEntity>>(getRepositoryToken(AffiliateEntity));
    referralRepo = module.get<Repository<ReferralEntity>>(getRepositoryToken(ReferralEntity));
    paymentRepo = module.get<Repository<PaymentEntity>>(getRepositoryToken(PaymentEntity));
    userRepo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    cacheService = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserDashboard', () => {
    it('should return cached dashboard if available', async () => {
      const userId = 1;
      const projectId = 1;
      const cachedData = {
        rank: { rank: 1, percentile: 5, display: '#1', percentileDisplay: 'Top 5% of affiliates' },
        referrals: { total: 100, weeklyChange: 10, weeklyChangeDisplay: '+10 this week' },
        conversions: { total: 50, conversionRate: 50, conversionRateDisplay: '50%' },
        earnings: { total: 1000, monthlyChange: 200, totalDisplay: '$1,000.00', monthlyChangeDisplay: '+$200.00 this month' }
      };

      jest.spyOn(cacheService, 'get').mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getUserDashboard(userId, projectId);

      expect(result).toEqual(cachedData);
      expect(cacheService.get).toHaveBeenCalledWith(`dash:${projectId}:${userId}`);
    });

    it('should throw NotFoundException if user not found', async () => {
      const userId = 999;
      const projectId = 1;

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      await expect(service.getUserDashboard(userId, projectId)).rejects.toThrow(NotFoundException);
    });

    it('should calculate and cache dashboard if not cached', async () => {
      const userId = 1;
      const projectId = 1;
      const mockUser = {
        id: userId,
        projectId,
        address: '0x123',
        displayName: 'Test User'
      } as UserEntity;

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(paymentRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
      jest.spyOn(referralRepo, 'count').mockResolvedValue(100);
      jest.spyOn(paymentRepo, 'count').mockResolvedValue(50);
      jest.spyOn(affiliateRepo, 'count').mockResolvedValue(100);

      mockQueryBuilder.getRawOne.mockResolvedValue({ total: '1000' });
      mockQueryBuilder.getRawMany.mockResolvedValue([]);
      mockQueryBuilder.getCount.mockResolvedValue(10);

      const result = await service.getUserDashboard(userId, projectId);

      expect(result).toHaveProperty('rank');
      expect(result).toHaveProperty('referrals');
      expect(result).toHaveProperty('conversions');
      expect(result).toHaveProperty('earnings');
      expect(cacheService.set).toHaveBeenCalled();
    });
  });

  describe('getMonthlyLeaderboard', () => {
    it('should return cached leaderboard if available', async () => {
      const projectId = 1;
      const query = { page: 1, limit: 100, year: 2025, month: 11 };
      const cachedData = {
        data: [],
        meta: {
          currentPage: 1,
          limit: 100,
          totalPages: 1,
          total: 0,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
          period: 'monthly' as const,
          year: 2025,
          month: 11
        }
      };

      jest.spyOn(cacheService, 'get').mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getMonthlyLeaderboard(projectId, query);

      expect(result).toEqual(cachedData);
      expect(cacheService.get).toHaveBeenCalledWith(`lb:${projectId}:monthly:2025:11:1:100`);
    });

    it('should calculate and cache leaderboard if not cached', async () => {
      const projectId = 1;
      const query = { page: 1, limit: 100, year: 2025, month: 11 };
      const mockResults = [
        {
          affiliate_id: 1,
          display_name: 'User 1',
          username: 'user1',
          address: '0x123',
          total_referrals: '50',
          total_conversions: '30',
          earnings: '1000.50',
          last_activity: new Date(),
          rank: '1'
        }
      ];

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(affiliateRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
      mockQueryBuilder.getRawMany.mockResolvedValue(mockResults);

      const result = await service.getMonthlyLeaderboard(projectId, query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('rank', 1);
      expect(result.data[0]).toHaveProperty('affiliateId', 1);
      expect(result.data[0]).toHaveProperty('totalReferrals', 50);
      expect(result.data[0]).toHaveProperty('totalConversions', 30);
      expect(result.meta.period).toBe('monthly');
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should use current month/year if not specified', async () => {
      const projectId = 1;
      const query = { page: 1, limit: 100 };
      const now = new Date();

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(affiliateRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      await service.getMonthlyLeaderboard(projectId, query);

      const expectedKey = `lb:${projectId}:monthly:${now.getFullYear()}:${now.getMonth() + 1}:1:100`;
      expect(cacheService.set).toHaveBeenCalledWith(
        expectedKey,
        expect.any(String),
        expect.any(Number)
      );
    });
  });

  describe('getAllTimeLeaderboard', () => {
    it('should return cached leaderboard if available', async () => {
      const projectId = 1;
      const query = { page: 1, limit: 100 };
      const cachedData = {
        data: [],
        meta: {
          currentPage: 1,
          limit: 100,
          totalPages: 1,
          total: 0,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
          period: 'all-time' as const,
          year: null,
          month: null
        }
      };

      jest.spyOn(cacheService, 'get').mockResolvedValue(JSON.stringify(cachedData));

      const result = await service.getAllTimeLeaderboard(projectId, query);

      expect(result).toEqual(cachedData);
      expect(cacheService.get).toHaveBeenCalledWith(`lb:${projectId}:alltime:1:100`);
    });

    it('should calculate and cache all-time leaderboard if not cached', async () => {
      const projectId = 1;
      const query = { page: 1, limit: 100 };
      const mockResults = [
        {
          affiliate_id: 1,
          display_name: 'User 1',
          username: 'user1',
          address: '0x123',
          total_referrals: '200',
          total_conversions: '150',
          earnings: '5000.00',
          last_activity: new Date(),
          rank: '1'
        }
      ];

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(affiliateRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
      mockQueryBuilder.getRawMany.mockResolvedValue(mockResults);

      const result = await service.getAllTimeLeaderboard(projectId, query);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('rank', 1);
      expect(result.data[0]).toHaveProperty('totalReferrals', 200);
      expect(result.data[0]).toHaveProperty('totalConversions', 150);
      expect(result.meta.period).toBe('all-time');
      expect(result.meta.year).toBeNull();
      expect(result.meta.month).toBeNull();
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should handle pagination correctly', async () => {
      const projectId = 1;
      const query = { page: 2, limit: 50 };
      const mockResults = Array.from({ length: 50 }, (_, i) => ({
        affiliate_id: i + 51,
        display_name: `User ${i + 51}`,
        username: `user${i + 51}`,
        address: `0x${i + 51}`,
        total_referrals: '10',
        total_conversions: '5',
        earnings: '100.00',
        last_activity: new Date(),
        rank: `${i + 51}`
      }));

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(affiliateRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
      mockQueryBuilder.getRawMany.mockResolvedValue(mockResults);

      const result = await service.getAllTimeLeaderboard(projectId, query);

      expect(result.data[0].rank).toBe(51); // Rank should start at 51 for page 2
      expect(result.meta.currentPage).toBe(2);
      expect(result.meta.hasPrevPage).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle user with no address', async () => {
      const userId = 1;
      const projectId = 1;
      const mockUser = {
        id: userId,
        projectId,
        address: null
      } as UserEntity;

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(mockUser);
      jest.spyOn(affiliateRepo, 'count').mockResolvedValue(100);

      const result = await service.getUserDashboard(userId, projectId);

      expect(result.rank.display).toBe('Unranked');
      expect(result.referrals.total).toBe(0);
      expect(result.conversions.total).toBe(0);
      expect(result.earnings.total).toBe(0);
    });

    it('should enforce max limit of 100', async () => {
      const projectId = 1;
      const query = { page: 1, limit: 500 }; // Request more than max

      jest.spyOn(cacheService, 'get').mockResolvedValue(null);
      jest.spyOn(affiliateRepo, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);
      mockQueryBuilder.getRawMany.mockResolvedValue([]);

      const result = await service.getAllTimeLeaderboard(projectId, query);

      expect(result.meta.limit).toBe(100); // Should be capped at 100
    });
  });
});
