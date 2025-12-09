import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import {
  SummaryService,
  TrendService,
  FunnelService,
  CampaignAnalyticsService,
  GeographyService,
  ExportService
} from './';
import {
  PeriodQueryDto,
  CampaignQueryDto,
  GeographyQueryDto,
  ExportQueryDto,
  SummaryResponseDto,
  TrendResponseDto,
  FunnelResponseDto,
  CampaignResponseDto,
  GeographyResponseDto
} from '../dto';

@Injectable()
export class AnalyticsService {
  private readonly CACHE_TTL_SUMMARY = 300; // 5 minutes
  private readonly CACHE_TTL_TREND = 600; // 10 minutes
  private readonly CACHE_TTL_FUNNEL = 300; // 5 minutes
  private readonly CACHE_TTL_CAMPAIGN = 180; // 3 minutes
  private readonly CACHE_TTL_GEOGRAPHY = 180; // 3 minutes

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private summaryService: SummaryService,
    private trendService: TrendService,
    private funnelService: FunnelService,
    private campaignAnalyticsService: CampaignAnalyticsService,
    private geographyService: GeographyService,
    private exportService: ExportService
  ) {}

  async getSummary(projectId: number, query: PeriodQueryDto): Promise<SummaryResponseDto> {
    const cacheKey = `analytics:summary:${projectId}:${query.period}:${query.from}:${query.to}`;

    const cached = await this.cacheManager.get<SummaryResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const customFrom = query.from ? new Date(query.from) : undefined;
    const customTo = query.to ? new Date(query.to) : undefined;

    const result = await this.summaryService.getSummary(
      projectId,
      query.period!,
      customFrom,
      customTo
    );

    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL_SUMMARY * 1000);

    return result;
  }

  async getTrend(projectId: number): Promise<TrendResponseDto> {
    const cacheKey = `analytics:trend:${projectId}`;

    const cached = await this.cacheManager.get<TrendResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.trendService.getTrend(projectId, 12);

    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL_TREND * 1000);

    return result;
  }

  async getFunnel(projectId: number, query: PeriodQueryDto): Promise<FunnelResponseDto> {
    const cacheKey = `analytics:funnel:${projectId}:${query.period}:${query.from}:${query.to}`;

    const cached = await this.cacheManager.get<FunnelResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const customFrom = query.from ? new Date(query.from) : undefined;
    const customTo = query.to ? new Date(query.to) : undefined;

    const result = await this.funnelService.getFunnel(
      projectId,
      query.period!,
      customFrom,
      customTo
    );

    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL_FUNNEL * 1000);

    return result;
  }

  async getCampaignAnalytics(
    projectId: number,
    query: CampaignQueryDto
  ): Promise<CampaignResponseDto> {
    const cacheKey = `analytics:campaign:${projectId}:${query.period}:${query.page}:${query.limit}:${query.sortBy}:${query.sortOrder}:${query.status}:${query.from}:${query.to}`;

    const cached = await this.cacheManager.get<CampaignResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const customFrom = query.from ? new Date(query.from) : undefined;
    const customTo = query.to ? new Date(query.to) : undefined;

    const result = await this.campaignAnalyticsService.getCampaignAnalytics(
      projectId,
      query.period!,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      query.status,
      customFrom,
      customTo
    );

    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL_CAMPAIGN * 1000);

    return result;
  }

  async getGeographyAnalytics(
    projectId: number,
    query: GeographyQueryDto
  ): Promise<GeographyResponseDto> {
    const cacheKey = `analytics:geography:${projectId}:${query.period}:${query.page}:${query.limit}:${query.sortBy}:${query.sortOrder}:${query.from}:${query.to}`;

    const cached = await this.cacheManager.get<GeographyResponseDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const customFrom = query.from ? new Date(query.from) : undefined;
    const customTo = query.to ? new Date(query.to) : undefined;

    const result = await this.geographyService.getGeographyAnalytics(
      projectId,
      query.period!,
      query.page,
      query.limit,
      query.sortBy,
      query.sortOrder,
      customFrom,
      customTo
    );

    await this.cacheManager.set(cacheKey, result, this.CACHE_TTL_GEOGRAPHY * 1000);

    return result;
  }

  async exportData(
    projectId: number,
    query: ExportQueryDto
  ): Promise<string> {
    const customFrom = query.from ? new Date(query.from) : undefined;
    const customTo = query.to ? new Date(query.to) : undefined;

    return this.exportService.exportToCSV(
      projectId,
      query.period!,
      query.fields,
      customFrom,
      customTo
    );
  }
}
