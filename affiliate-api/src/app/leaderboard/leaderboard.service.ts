import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../user/user.entity';
import { CacheService } from '../../shared/cache/cache.service';
import {
  DashboardResponseDto,
  LeaderboardQueryDto,
  LeaderboardResponseDto
} from './dto';
import { RankingService, ReferralsService, EarningsService, MetricsService } from './services';

/**
 * Main leaderboard service that orchestrates specialized services
 * Handles caching and coordinates between different metric services
 */
@Injectable()
export class LeaderboardService {
  private readonly CACHE_TTL_DASHBOARD = 60; // 60 seconds
  private readonly CACHE_TTL_MONTHLY = 60; // 60 seconds
  private readonly CACHE_TTL_ALLTIME = 120; // 120 seconds

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly cacheService: CacheService,
    private readonly rankingService: RankingService,
    private readonly referralsService: ReferralsService,
    private readonly earningsService: EarningsService,
    private readonly metricsService: MetricsService
  ) {}

  /**
   * Get user dashboard with rank, referrals, conversions, and earnings
   */
  async getUserDashboard(userId: number, projectId: number): Promise<DashboardResponseDto> {
    const cacheKey = `dash:${projectId}:${userId}`;
    const cached = await this.cacheService.get<string>(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    // Get user's record
    const user = await this.userRepo.findOne({ where: { id: userId, projectId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Fetch all dashboard metrics in parallel
    const [rank, referrals, conversions, earnings] = await Promise.all([
      this.rankingService.getUserRank(userId, projectId),
      this.referralsService.getUserReferrals(user.address || '', projectId),
      this.referralsService.getUserConversions(user.address || '', projectId),
      this.earningsService.getUserEarnings(user.address || '', projectId)
    ]);

    const dashboard: DashboardResponseDto = {
      rank,
      referrals,
      conversions,
      earnings
    };

    await this.cacheService.set(cacheKey, JSON.stringify(dashboard), this.CACHE_TTL_DASHBOARD);
    return dashboard;
  }

  /**
   * Get monthly leaderboard (top 100 affiliates by month performance)
   */
  async getMonthlyLeaderboard(
    projectId: number,
    query: LeaderboardQueryDto
  ): Promise<LeaderboardResponseDto> {
    const now = new Date();
    const year = query.year || now.getFullYear();
    const month = query.month || now.getMonth() + 1;
    const page = query.page || 1;
    const limit = Math.min(query.limit || 100, 100);

    const cacheKey = `lb:${projectId}:monthly:${year}:${month}:${page}:${limit}`;
    const cached = await this.cacheService.get<string>(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, meta } = await this.metricsService.getMonthlyLeaderboard(projectId, query);

    const response: LeaderboardResponseDto = { data, meta };

    await this.cacheService.set(cacheKey, JSON.stringify(response), this.CACHE_TTL_MONTHLY);
    return response;
  }

  /**
   * Get all-time leaderboard (top 100 affiliates by lifetime performance)
   */
  async getAllTimeLeaderboard(
    projectId: number,
    query: LeaderboardQueryDto
  ): Promise<LeaderboardResponseDto> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 100, 100);

    const cacheKey = `lb:${projectId}:alltime:${page}:${limit}`;
    const cached = await this.cacheService.get<string>(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const { data, meta } = await this.metricsService.getAllTimeLeaderboard(projectId, query);

    const response: LeaderboardResponseDto = { data, meta };

    await this.cacheService.set(cacheKey, JSON.stringify(response), this.CACHE_TTL_ALLTIME);
    return response;
  }
}
