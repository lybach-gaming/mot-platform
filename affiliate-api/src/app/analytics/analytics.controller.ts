import {
  Controller,
  Get,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Header
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AnalyticsService } from './services';
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
} from './dto';
import { CurrentProject } from '../../shared/decorators/current-project.decorator';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('summary')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get analytics summary with period comparison',
    description: 'Returns core metrics (impressions, clicks, conversions, revenue) for the current period and comparison with previous period'
  })
  @ApiResponse({
    status: 200,
    description: 'Analytics summary retrieved successfully',
    type: SummaryResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'period', required: false, enum: ['last_7_days', 'last_30_days', 'last_90_days', 'last_year', 'all_time', 'custom'] })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Start date (YYYY-MM-DD) for custom period' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'End date (YYYY-MM-DD) for custom period' })
  async getSummary(
    @CurrentProject() projectId: number,
    @Query() query: PeriodQueryDto
  ): Promise<SummaryResponseDto> {
    return this.analyticsService.getSummary(projectId, query);
  }

  @Get('trend')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get 12-month trend data',
    description: 'Returns historical trend data for the last 12 months showing impressions, clicks, conversions, and revenue over time'
  })
  @ApiResponse({
    status: 200,
    description: 'Trend data retrieved successfully',
    type: TrendResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getTrend(
    @CurrentProject() projectId: number
  ): Promise<TrendResponseDto> {
    return this.analyticsService.getTrend(projectId);
  }

  @Get('funnel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get conversion funnel analysis',
    description: 'Returns funnel data showing progression from impressions → clicks → conversions with dropoff rates'
  })
  @ApiResponse({
    status: 200,
    description: 'Funnel data retrieved successfully',
    type: FunnelResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'period', required: false, enum: ['last_7_days', 'last_30_days', 'last_90_days', 'last_year', 'all_time', 'custom'] })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Start date (YYYY-MM-DD) for custom period' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'End date (YYYY-MM-DD) for custom period' })
  async getFunnel(
    @CurrentProject() projectId: number,
    @Query() query: PeriodQueryDto
  ): Promise<FunnelResponseDto> {
    return this.analyticsService.getFunnel(projectId, query);
  }

  @Get('campaigns')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get campaign performance analytics',
    description: 'Returns performance metrics for all campaigns with pagination, sorting, and filtering'
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign analytics retrieved successfully',
    type: CampaignResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'period', required: false, enum: ['last_7_days', 'last_30_days', 'last_90_days', 'last_year', 'all_time', 'custom'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['impressions', 'clicks', 'conversions', 'revenue', 'ctr', 'conversionRate'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'paused', 'inactive', 'completed'] })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Start date (YYYY-MM-DD) for custom period' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'End date (YYYY-MM-DD) for custom period' })
  async getCampaignAnalytics(
    @CurrentProject() projectId: number,
    @Query() query: CampaignQueryDto
  ): Promise<CampaignResponseDto> {
    return this.analyticsService.getCampaignAnalytics(projectId, query);
  }

  @Get('geography')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get geographic performance breakdown',
    description: 'Returns performance metrics grouped by country with pagination and sorting'
  })
  @ApiResponse({
    status: 200,
    description: 'Geography analytics retrieved successfully',
    type: GeographyResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'period', required: false, enum: ['last_7_days', 'last_30_days', 'last_90_days', 'last_year', 'all_time', 'custom'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['clicks', 'conversions', 'revenue', 'conversionRate'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Start date (YYYY-MM-DD) for custom period' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'End date (YYYY-MM-DD) for custom period' })
  async getGeographyAnalytics(
    @CurrentProject() projectId: number,
    @Query() query: GeographyQueryDto
  ): Promise<GeographyResponseDto> {
    return this.analyticsService.getGeographyAnalytics(projectId, query);
  }

  @Get('export')
  @HttpCode(HttpStatus.OK)
  @Header('Content-Type', 'text/csv')
  @Header('Content-Disposition', 'attachment; filename="analytics-export.csv"')
  @ApiOperation({
    summary: 'Export analytics data to CSV',
    description: 'Exports analytics data to CSV format with configurable fields and date range'
  })
  @ApiResponse({
    status: 200,
    description: 'CSV export generated successfully',
    schema: { type: 'string', format: 'binary' }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiQuery({ name: 'period', required: false, enum: ['last_7_days', 'last_30_days', 'last_90_days', 'last_year', 'all_time', 'custom'] })
  @ApiQuery({ name: 'fields', required: false, type: [String], description: 'Comma-separated list of fields to export' })
  @ApiQuery({ name: 'from', required: false, type: String, description: 'Start date (YYYY-MM-DD) for custom period' })
  @ApiQuery({ name: 'to', required: false, type: String, description: 'End date (YYYY-MM-DD) for custom period' })
  async exportData(
    @CurrentProject() projectId: number,
    @Query() query: ExportQueryDto
  ): Promise<string> {
    return this.analyticsService.exportData(projectId, query);
  }
}
