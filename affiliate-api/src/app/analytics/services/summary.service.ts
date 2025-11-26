import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImpressionEntity, ClickEntity, ConversionEntity } from '../entities';
import { DateRangeService, DateRange } from './date-range.service';
import { SummaryResponseDto, CoreMetricsDto } from '../dto';
import { TimePeriod } from '../types/period.types';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(ImpressionEntity)
    private impressionRepo: Repository<ImpressionEntity>,
    @InjectRepository(ClickEntity)
    private clickRepo: Repository<ClickEntity>,
    @InjectRepository(ConversionEntity)
    private conversionRepo: Repository<ConversionEntity>,
    private dateRangeService: DateRangeService
  ) {}

  async getSummary(
    projectId: number,
    period: TimePeriod,
    customFrom?: Date,
    customTo?: Date
  ): Promise<SummaryResponseDto> {
    const currentRange = this.dateRangeService.getPeriodRange(period, customFrom, customTo);
    const previousRange = this.dateRangeService.getPreviousPeriod(period, currentRange);

    const [currentMetrics, previousMetrics] = await Promise.all([
      this.calculatePeriodMetrics(projectId, currentRange),
      this.calculatePeriodMetrics(projectId, previousRange)
    ]);

    return {
      current: currentMetrics,
      previous: previousMetrics,
      period,
      dateRange: {
        from: this.dateRangeService.formatDate(currentRange.startDate),
        to: this.dateRangeService.formatDate(currentRange.endDate)
      }
    };
  }

  private async calculatePeriodMetrics(
    projectId: number,
    range: DateRange
  ): Promise<CoreMetricsDto> {
    const { startDate, endDate } = range;

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
    const averageOrderValue = conversions > 0 ? revenue / conversions : 0;
    const roi = commission > 0 ? ((revenue - commission) / commission) * 100 : 0;

    return {
      impressions,
      clicks,
      conversions,
      ctr: Math.round(ctr * 100) / 100,
      conversionRate: Math.round(conversionRate * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
      commission: Math.round(commission * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      roi: Math.round(roi * 100) / 100
    };
  }
}
