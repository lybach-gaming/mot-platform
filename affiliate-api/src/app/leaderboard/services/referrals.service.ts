import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferralEntity } from '../../referral/referral.entity';
import { DashboardReferralsDto, DashboardConversionsDto } from '../dto';
import { PaymentEntity } from '../../payment/payment.entity';

/**
 * Service responsible for referral and conversion metrics
 */
@Injectable()
export class ReferralsService {
  constructor(
    @InjectRepository(ReferralEntity)
    private readonly referralRepo: Repository<ReferralEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>
  ) {}

  /**
   * Get user's referral statistics with weekly change
   */
  async getUserReferrals(address: string, projectId: number): Promise<DashboardReferralsDto> {
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
   * Get user's conversion statistics with conversion rate
   */
  async getUserConversions(address: string, projectId: number): Promise<DashboardConversionsDto> {
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
}
