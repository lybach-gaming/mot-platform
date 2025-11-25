import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AffiliateEntity } from '../../affiliate/affiliate.entity';
import { ReferralEntity } from '../../referral/referral.entity';
import { PaymentEntity } from '../../payment/payment.entity';
import { UserEntity } from '../../user/user.entity';
import { LeaderboardQueryDto, LeaderboardResponseDto, LeaderboardEntryDto, LeaderboardMetaDto } from '../dto';

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

/**
 * Service responsible for leaderboard metrics and aggregations
 */
@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(AffiliateEntity)
    private readonly affiliateRepo: Repository<AffiliateEntity>,
    @InjectRepository(ReferralEntity)
    private readonly referralRepo: Repository<ReferralEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

  /**
   * Get monthly leaderboard data
   */
  async getMonthlyLeaderboard(
    projectId: number,
    query: LeaderboardQueryDto
  ): Promise<{ data: LeaderboardEntryDto[]; meta: LeaderboardMetaDto; total: number }> {
    const now = new Date();
    const year = query.year || now.getFullYear();
    const month = query.month || now.getMonth() + 1;
    const page = query.page || 1;
    const limit = Math.min(query.limit || 100, 100);

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

    // Transform results
    const data = this.transformLeaderboardResults(rawResults, offset);

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

    return { data, meta, total };
  }

  /**
   * Get all-time leaderboard data
   */
  async getAllTimeLeaderboard(
    projectId: number,
    query: LeaderboardQueryDto
  ): Promise<{ data: LeaderboardEntryDto[]; meta: LeaderboardMetaDto; total: number }> {
    const page = query.page || 1;
    const limit = Math.min(query.limit || 100, 100);
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

    // Transform results
    const data = this.transformLeaderboardResults(rawResults, offset);

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

    return { data, meta, total };
  }

  /**
   * Transform raw database results to LeaderboardEntryDto
   */
  private transformLeaderboardResults(rawResults: LeaderboardRawEntry[], offset: number): LeaderboardEntryDto[] {
    return rawResults.map((row, index) => {
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
