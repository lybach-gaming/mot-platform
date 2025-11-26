import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImpressionEntity, ClickEntity, ConversionEntity } from '../entities';
import { DateRangeService } from './date-range.service';
import { TrendResponseDto, TrendDataPointDto } from '../dto';

@Injectable()
export class TrendService {
  constructor(
    @InjectRepository(ImpressionEntity)
    private impressionRepo: Repository<ImpressionEntity>,
    @InjectRepository(ClickEntity)
    private clickRepo: Repository<ClickEntity>,
    @InjectRepository(ConversionEntity)
    private conversionRepo: Repository<ConversionEntity>,
    private dateRangeService: DateRangeService
  ) {}

  async getTrend(projectId: number, months: number = 12): Promise<TrendResponseDto> {
    const monthlyRanges = this.dateRangeService.getMonthlyRanges(months);

    const dataPoints = await Promise.all(
      monthlyRanges.map(range => this.calculateMonthlyMetrics(projectId, range))
    );

    return {
      dataPoints,
      period: `Last ${months} months`,
      totalDataPoints: dataPoints.length
    };
  }

  private async calculateMonthlyMetrics(
    projectId: number,
    range: { startDate: Date; endDate: Date; label: string }
  ): Promise<TrendDataPointDto> {
    const { startDate, endDate, label } = range;

    const [impressionsResult, clicksResult, conversionsResult, revenueResult] = await Promise.all([
      this.impressionRepo
        .createQueryBuilder('i')
        .select('COUNT(*)', 'total')
        .where('i.project_id = :projectId', { projectId })
        .andWhere('i.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getRawOne(),

      this.clickRepo
        .createQueryBuilder('c')
        .select('COUNT(*)', 'total')
        .where('c.project_id = :projectId', { projectId })
        .andWhere('c.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getRawOne(),

      this.conversionRepo
        .createQueryBuilder('conv')
        .select('COUNT(*)', 'total')
        .where('conv.project_id = :projectId', { projectId })
        .andWhere('conv.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getRawOne(),

      this.conversionRepo
        .createQueryBuilder('conv')
        .select('COALESCE(SUM(conv.order_value), 0)', 'revenue')
        .addSelect('COALESCE(SUM(conv.commission_amount), 0)', 'commission')
        .where('conv.project_id = :projectId', { projectId })
        .andWhere('conv.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getRawOne()
    ]);

    const impressions = parseInt(impressionsResult?.total || '0', 10);
    const clicks = parseInt(clicksResult?.total || '0', 10);
    const conversions = parseInt(conversionsResult?.total || '0', 10);
    const revenue = parseFloat(revenueResult?.revenue || '0');
    const commission = parseFloat(revenueResult?.commission || '0');

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

    return {
      date: this.dateRangeService.formatDate(startDate),
      label,
      impressions,
      clicks,
      conversions,
      revenue: Math.round(revenue * 100) / 100,
      commission: Math.round(commission * 100) / 100,
      ctr: Math.round(ctr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100
    };
  }
}
