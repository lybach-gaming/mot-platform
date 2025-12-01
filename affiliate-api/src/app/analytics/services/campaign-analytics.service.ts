import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignEntity, ImpressionEntity, ClickEntity, ConversionEntity } from '../entities';
import { DateRangeService } from './date-range.service';
import { CampaignResponseDto, CampaignPerformanceDto, PaginationMetaDto } from '../dto';
import { TimePeriod } from '../types/period.types';
import { CampaignStatus } from '../types/campaign.types';
import {
  calculateCTR,
  calculateConversionRate,
  calculateROI,
  roundToTwoDecimals
} from '../../../shared/utils/calculation.utils';

@Injectable()
export class CampaignAnalyticsService {
  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepo: Repository<CampaignEntity>,
    @InjectRepository(ImpressionEntity)
    private impressionRepo: Repository<ImpressionEntity>,
    @InjectRepository(ClickEntity)
    private clickRepo: Repository<ClickEntity>,
    @InjectRepository(ConversionEntity)
    private conversionRepo: Repository<ConversionEntity>,
    private dateRangeService: DateRangeService
  ) {}

  private readonly ALLOWED_SORT_FIELDS = [
    'impressions',
    'clicks',
    'conversions',
    'revenue',
    'commission',
    'ctr',
    'conversionRate',
    'roi'
  ];

  async getCampaignAnalytics(
    projectId: number,
    period: TimePeriod,
    page = 1,
    limit = 10,
    sortBy = 'conversions',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    status?: CampaignStatus,
    customFrom?: Date,
    customTo?: Date
  ): Promise<CampaignResponseDto> {
    if (!this.ALLOWED_SORT_FIELDS.includes(sortBy)) {
      sortBy = 'conversions';
    }

    const range = this.dateRangeService.getPeriodRange(period, customFrom, customTo);
    const { startDate, endDate } = range;

    const queryBuilder = this.campaignRepo
      .createQueryBuilder('campaign')
      .where('campaign.project_id = :projectId', { projectId });

    if (status) {
      queryBuilder.andWhere('campaign.status = :status', { status });
    }

    const totalItems = await queryBuilder.getCount();
    const campaigns = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    const campaignsWithMetrics = await Promise.all(
      campaigns.map(campaign => this.calculateCampaignMetrics(campaign, startDate, endDate))
    );

    const sortedCampaigns = this.sortCampaigns(campaignsWithMetrics, sortBy, sortOrder);

    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPreviousPage: page > 1
    };

    return {
      campaigns: sortedCampaigns,
      meta,
      period,
      dateRange: {
        from: this.dateRangeService.formatDate(startDate),
        to: this.dateRangeService.formatDate(endDate)
      }
    };
  }

  private async calculateCampaignMetrics(
    campaign: CampaignEntity,
    startDate: Date,
    endDate: Date
  ): Promise<CampaignPerformanceDto> {
    const [impressionsResult, clicksResult, conversionsResult, revenueResult] = await Promise.all([
      this.impressionRepo
        .createQueryBuilder('i')
        .select('COUNT(*)', 'total')
        .where('i.campaign_id = :campaignId', { campaignId: campaign.id })
        .andWhere('i.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getRawOne(),

      this.clickRepo
        .createQueryBuilder('c')
        .select('COUNT(*)', 'total')
        .where('c.campaign_id = :campaignId', { campaignId: campaign.id })
        .andWhere('c.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getRawOne(),

      this.conversionRepo
        .createQueryBuilder('conv')
        .select('COUNT(*)', 'total')
        .where('conv.campaign_id = :campaignId', { campaignId: campaign.id })
        .andWhere('conv.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getRawOne(),

      this.conversionRepo
        .createQueryBuilder('conv')
        .select('COALESCE(SUM(conv.order_value), 0)', 'revenue')
        .addSelect('COALESCE(SUM(conv.commission_amount), 0)', 'commission')
        .where('conv.campaign_id = :campaignId', { campaignId: campaign.id })
        .andWhere('conv.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
        .getRawOne()
    ]);

    const impressions = parseInt(impressionsResult?.total || '0', 10);
    const clicks = parseInt(clicksResult?.total || '0', 10);
    const conversions = parseInt(conversionsResult?.total || '0', 10);
    const revenue = parseFloat(revenueResult?.revenue || '0');
    const commission = parseFloat(revenueResult?.commission || '0');

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      status: campaign.status,
      impressions,
      clicks,
      conversions,
      ctr: calculateCTR(clicks, impressions),
      conversionRate: calculateConversionRate(conversions, clicks),
      revenue: roundToTwoDecimals(revenue),
      commission: roundToTwoDecimals(commission),
      roi: calculateROI(revenue, commission)
    };
  }

  private sortCampaigns(
    campaigns: CampaignPerformanceDto[],
    sortBy: string,
    sortOrder: 'ASC' | 'DESC'
  ): CampaignPerformanceDto[] {
    return campaigns.sort((a, b) => {
      const aValue = a[sortBy as keyof CampaignPerformanceDto] || 0;
      const bValue = b[sortBy as keyof CampaignPerformanceDto] || 0;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'ASC' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'ASC'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
  }
}
