import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AffiliateEntity } from '../affiliate/affiliate.entity';
import { ReferralEntity } from '../referral/referral.entity';
import { PaymentEntity } from '../payment/payment.entity';
import { UserEntity } from '../user/user.entity';
import { CacheService } from '../../shared/cache/cache.service';
import {
  DashboardResponseDto,
  DashboardRankDto,
  DashboardReferralsDto,
  DashboardConversionsDto,
  DashboardEarningsDto,
  LeaderboardQueryDto,
  LeaderboardResponseDto,
  LeaderboardEntryDto,
  LeaderboardMetaDto
} from './dto';

interface LeaderboardRawEntry {
  affiliate_id: number;
  display_name: string | null;
  username: string | null;
  address: string | null;
  total_referrals: string;
  total_conversions: string;
  earnings: string;
  last_activity: Date | null;
  rank: string;
}

@Injectable()
export class LeaderboardService {
  private readonly CACHE_TTL_DASHBOARD = 60; // 60 seconds
  private readonly CACHE_TTL_MONTHLY = 60; // 60 seconds
  private readonly CACHE_TTL_ALLTIME = 120; // 120 seconds

  constructor(
    @InjectRepository(AffiliateEntity)
    private readonly affiliateRepo: Repository<AffiliateEntity>,
    @InjectRepository(ReferralEntity)
    private readonly referralRepo: Repository<ReferralEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private readonly cacheService: CacheService
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

    // Get user's affiliate record
    const user = await this.userRepo.findOne({ where: { id: userId, projectId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get rank information
    const rank = await this.getUserRank(userId, projectId);

    // Get referrals information
    const referrals = await this.getUserReferrals(user.address || '', projectId);

    // Get conversions information
    const conversions = await this.getUserConversions(user.address || '', projectId);

    // Get earnings information
    const earnings = await this.getUserEarnings(user.address || '', projectId);

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

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const offset = (page - 1) * limit;

    // Build the leaderboard query with aggregations
    const queryBuilder = this.affiliateRepo
      .createQueryBuilder('a')
      .leftJoin(UserEntity, 'u', 'u.address = a.address AND u.project_id = a.project_id')
      .leftJoin(
        ReferralEntity,
        'r',
        'r.referrer_address = a.address AND r.project_id = a.project_id AND r.created_at >= :startDate AND r.created_at <= :endDate AND r.verified = true AND r.disqualified = false'
      )
      .leftJoin(
        PaymentEntity,
        'p',
        'p.invited_by_address = a.address AND p.project_id = a.project_id AND p.created_at >= :startDate AND p.created_at <= :endDate'
      )
      .select('a.id', 'affiliate_id')
      .addSelect('u.display_name', 'display_name')
      .addSelect('u.username', 'username')
      .addSelect('a.address', 'address')
      .addSelect('COUNT(DISTINCT r.id)', 'total_referrals')
      .addSelect('COUNT(DISTINCT p.id)', 'total_conversions')
      .addSelect('COALESCE(SUM(p.value), 0)', 'earnings')
      .addSelect('MAX(GREATEST(r.created_at, p.created_at))', 'last_activity')
      .where('a.project_id = :projectId', { projectId })
      .groupBy('a.id')
      .addGroupBy('u.display_name')
      .addGroupBy('u.username')
      .addGroupBy('a.address')
      .orderBy('earnings', 'DESC')
      .addOrderBy('total_conversions', 'DESC')
      .addOrderBy('total_referrals', 'DESC')
      .setParameters({ startDate, endDate, projectId });

    // Get total count
    const countQuery = await queryBuilder.getRawMany();
    const total = countQuery.length;

    // Add pagination
    const rawResults: LeaderboardRawEntry[] = await queryBuilder
      .limit(limit)
      .offset(offset)
      .getRawMany();

    // Transform results and add rank
    const data: LeaderboardEntryDto[] = rawResults.map((row, index) => {
      const earnings = parseFloat(row.earnings);
      const totalReferrals = parseInt(row.total_referrals, 10);
      const totalConversions = parseInt(row.total_conversions, 10);
      const rank = offset + index + 1;

      return {
        rank,
        affiliateId: row.affiliate_id,
        name: row.display_name || row.username,
        address: row.address,
        totalReferrals,
        totalConversions,
        earnings,
        status: this.getAccountStatus(row.last_activity),
        earningsDisplay: this.formatCurrency(earnings)
      };
    });

    const meta: LeaderboardMetaDto = {
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
      nextPage: page * limit < total ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      period: 'monthly',
      year,
      month
    };

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

    const offset = (page - 1) * limit;

    // Build the leaderboard query with aggregations
    const queryBuilder = this.affiliateRepo
      .createQueryBuilder('a')
      .leftJoin(UserEntity, 'u', 'u.address = a.address AND u.project_id = a.project_id')
      .leftJoin(
        ReferralEntity,
        'r',
        'r.referrer_address = a.address AND r.project_id = a.project_id AND r.verified = true AND r.disqualified = false'
      )
      .leftJoin(
        PaymentEntity,
        'p',
        'p.invited_by_address = a.address AND p.project_id = a.project_id'
      )
      .select('a.id', 'affiliate_id')
      .addSelect('u.display_name', 'display_name')
      .addSelect('u.username', 'username')
      .addSelect('a.address', 'address')
      .addSelect('COUNT(DISTINCT r.id)', 'total_referrals')
      .addSelect('COUNT(DISTINCT p.id)', 'total_conversions')
      .addSelect('COALESCE(SUM(p.value), 0)', 'earnings')
      .addSelect('MAX(GREATEST(r.created_at, p.created_at))', 'last_activity')
      .where('a.project_id = :projectId', { projectId })
      .groupBy('a.id')
      .addGroupBy('u.display_name')
      .addGroupBy('u.username')
      .addGroupBy('a.address')
      .orderBy('earnings', 'DESC')
      .addOrderBy('total_conversions', 'DESC')
      .addOrderBy('total_referrals', 'DESC')
      .setParameters({ projectId });

    // Get total count
    const countQuery = await queryBuilder.getRawMany();
    const total = countQuery.length;

    // Add pagination
    const rawResults: LeaderboardRawEntry[] = await queryBuilder
      .limit(limit)
      .offset(offset)
      .getRawMany();

    // Transform results and add rank
    const data: LeaderboardEntryDto[] = rawResults.map((row, index) => {
      const earnings = parseFloat(row.earnings);
      const totalReferrals = parseInt(row.total_referrals, 10);
      const totalConversions = parseInt(row.total_conversions, 10);
      const rank = offset + index + 1;

      return {
        rank,
        affiliateId: row.affiliate_id,
        name: row.display_name || row.username,
        address: row.address,
        totalReferrals,
        totalConversions,
        earnings,
        status: this.getAccountStatus(row.last_activity),
        earningsDisplay: this.formatCurrency(earnings)
      };
    });

    const meta: LeaderboardMetaDto = {
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
      total,
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
      nextPage: page * limit < total ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
      period: 'all-time',
      year: null,
      month: null
    };

    const response: LeaderboardResponseDto = { data, meta };

    await this.cacheService.set(cacheKey, JSON.stringify(response), this.CACHE_TTL_ALLTIME);
    return response;
  }

  /**
   * Get user's rank information
   */
  private async getUserRank(userId: number, projectId: number): Promise<DashboardRankDto> {
    const user = await this.userRepo.findOne({ where: { id: userId, projectId } });
    if (!user?.address) {
      return {
        rank: 0,
        percentile: 100,
        display: 'Unranked',
        percentileDisplay: 'Not ranked yet'
      };
    }

    // Calculate user's total earnings
    const userEarnings = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.value), 0)', 'total')
      .where('p.project_id = :projectId', { projectId })
      .andWhere('p.invited_by_address = :address', { address: user.address })
      .getRawOne();

    const userTotal = parseFloat(userEarnings?.total || '0');

    // Count how many affiliates have higher earnings
    const higherRank = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COUNT(DISTINCT p.invited_by_address)', 'count')
      .where('p.project_id = :projectId', { projectId })
      .andWhere('p.invited_by_address != :address', { address: user.address })
      .groupBy('p.invited_by_address')
      .having('SUM(p.value) > :userTotal', { userTotal })
      .getRawMany();

    const rank = higherRank.length + 1;

    // Get total number of affiliates
    const totalAffiliates = await this.affiliateRepo.count({ where: { projectId } });

    const percentile = totalAffiliates > 0 ? ((rank / totalAffiliates) * 100) : 0;

    return {
      rank,
      percentile: Math.round(percentile * 100) / 100,
      display: `#${rank}`,
      percentileDisplay: `Top ${Math.round(percentile * 10) / 10}% of affiliates`
    };
  }

  /**
   * Get user's referral statistics
   */
  private async getUserReferrals(address: string, projectId: number): Promise<DashboardReferralsDto> {
    if (!address) {
      return {
        total: 0,
        weeklyChange: 0,
        weeklyChangeDisplay: '+0 this week'
      };
    }

    // Total referrals
    const total = await this.referralRepo.count({
      where: {
        referrerAddress: address,
        projectId,
        verified: true,
        disqualified: false
      }
    });

    // Weekly change (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weeklyCount = await this.referralRepo
      .createQueryBuilder('r')
      .where('r.referrer_address = :address', { address })
      .andWhere('r.project_id = :projectId', { projectId })
      .andWhere('r.verified = true')
      .andWhere('r.disqualified = false')
      .andWhere('r.created_at >= :weekAgo', { weekAgo })
      .getCount();

    return {
      total,
      weeklyChange: weeklyCount,
      weeklyChangeDisplay: `${weeklyCount >= 0 ? '+' : ''}${weeklyCount} this week`
    };
  }

  /**
   * Get user's conversion statistics
   */
  private async getUserConversions(address: string, projectId: number): Promise<DashboardConversionsDto> {
    if (!address) {
      return {
        total: 0,
        conversionRate: 0,
        conversionRateDisplay: '0%'
      };
    }

    // Total conversions
    const total = await this.paymentRepo.count({
      where: {
        invitedByAddress: address,
        projectId
      }
    });

    // Total referrals for conversion rate
    const totalReferrals = await this.referralRepo.count({
      where: {
        referrerAddress: address,
        projectId,
        verified: true,
        disqualified: false
      }
    });

    const conversionRate = totalReferrals > 0 ? (total / totalReferrals) * 100 : 0;

    return {
      total,
      conversionRate: Math.round(conversionRate * 100) / 100,
      conversionRateDisplay: `${Math.round(conversionRate * 100) / 100}%`
    };
  }

  /**
   * Get user's earnings statistics
   */
  private async getUserEarnings(address: string, projectId: number): Promise<DashboardEarningsDto> {
    if (!address) {
      return {
        total: 0,
        monthlyChange: 0,
        totalDisplay: '$0.00',
        monthlyChangeDisplay: '+$0.00 this month'
      };
    }

    // Total earnings
    const totalResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.value), 0)', 'total')
      .where('p.invited_by_address = :address', { address })
      .andWhere('p.project_id = :projectId', { projectId })
      .getRawOne();

    const total = parseFloat(totalResult?.total || '0');

    // Monthly change (current month)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyResult = await this.paymentRepo
      .createQueryBuilder('p')
      .select('COALESCE(SUM(p.value), 0)', 'total')
      .where('p.invited_by_address = :address', { address })
      .andWhere('p.project_id = :projectId', { projectId })
      .andWhere('p.created_at >= :monthStart', { monthStart })
      .getRawOne();

    const monthlyChange = parseFloat(monthlyResult?.total || '0');

    return {
      total,
      monthlyChange,
      totalDisplay: this.formatCurrency(total),
      monthlyChangeDisplay: `${monthlyChange >= 0 ? '+' : ''}${this.formatCurrency(monthlyChange)} this month`
    };
  }

  /**
   * Determine account status based on last activity
   */
  private getAccountStatus(lastActivity: Date | null): 'Active' | 'Inactive' {
    if (!lastActivity) return 'Inactive';

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return lastActivity >= thirtyDaysAgo ? 'Active' : 'Inactive';
  }

  /**
   * Format currency value to USD display format
   */
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}
