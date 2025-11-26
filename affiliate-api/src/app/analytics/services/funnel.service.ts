import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ImpressionEntity, ClickEntity, ConversionEntity } from '../entities';
import { DateRangeService } from './date-range.service';
import { FunnelResponseDto, FunnelStageDto } from '../dto';
import { TimePeriod } from '../types/period.types';

@Injectable()
export class FunnelService {
  constructor(
    @InjectRepository(ImpressionEntity)
    private impressionRepo: Repository<ImpressionEntity>,
    @InjectRepository(ClickEntity)
    private clickRepo: Repository<ClickEntity>,
    @InjectRepository(ConversionEntity)
    private conversionRepo: Repository<ConversionEntity>,
    private dateRangeService: DateRangeService
  ) {}

  async getFunnel(
    projectId: number,
    period: TimePeriod,
    customFrom?: Date,
    customTo?: Date
  ): Promise<FunnelResponseDto> {
    const range = this.dateRangeService.getPeriodRange(period, customFrom, customTo);
    const { startDate, endDate } = range;

    const [impressionsResult, clicksResult, conversionsResult] = await Promise.all([
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
        .getRawOne()
    ]);

    const impressions = parseInt(impressionsResult?.total || '0', 10);
    const clicks = parseInt(clicksResult?.total || '0', 10);
    const conversions = parseInt(conversionsResult?.total || '0', 10);

    const stages: FunnelStageDto[] = [
      {
        stage: 'impressions',
        label: 'Impressions',
        count: impressions,
        percentage: 100,
        dropoff: 0
      },
      {
        stage: 'clicks',
        label: 'Clicks',
        count: clicks,
        percentage: impressions > 0 ? Math.round((clicks / impressions) * 10000) / 100 : 0,
        dropoff: impressions > 0 ? Math.round(((impressions - clicks) / impressions) * 10000) / 100 : 0
      },
      {
        stage: 'conversions',
        label: 'Conversions',
        count: conversions,
        percentage: impressions > 0 ? Math.round((conversions / impressions) * 10000) / 100 : 0,
        dropoff: clicks > 0 ? Math.round(((clicks - conversions) / clicks) * 10000) / 100 : 0
      }
    ];

    const overallConversionRate = impressions > 0
      ? Math.round((conversions / impressions) * 10000) / 100
      : 0;

    return {
      stages,
      overallConversionRate,
      period,
      dateRange: {
        from: this.dateRangeService.formatDate(startDate),
        to: this.dateRangeService.formatDate(endDate)
      }
    };
  }
}
