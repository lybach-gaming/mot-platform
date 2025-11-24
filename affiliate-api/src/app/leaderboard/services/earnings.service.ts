import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentEntity } from '../../payment/payment.entity';
import { DashboardEarningsDto } from '../dto';

/**
 * Service responsible for earnings calculations and formatting
 */
@Injectable()
export class EarningsService {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly paymentRepo: Repository<PaymentEntity>
  ) {}

  /**
   * Get user's earnings statistics with monthly change
   */
  async getUserEarnings(address: string, projectId: number): Promise<DashboardEarningsDto> {
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
   * Format currency value to USD display format
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }
}
