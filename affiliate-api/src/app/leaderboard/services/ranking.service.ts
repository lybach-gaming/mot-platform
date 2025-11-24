import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../payment/payment.entity';
import { AffiliateEntity } from '../../affiliate/affiliate.entity';
import { UserEntity } from '../../user/user.entity';
import { DashboardRankDto } from '../dto';

/**
 * Service responsible for calculating user rankings and percentiles
 */
@Injectable()
export class RankingService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>,
    @InjectRepository(AffiliateEntity)
    private readonly affiliateRepo: Repository<AffiliateEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>
  ) {}

  /**
   * Calculate user's rank and percentile position
   */
  async getUserRank(userId: number, projectId: number): Promise<DashboardRankDto> {
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
}
