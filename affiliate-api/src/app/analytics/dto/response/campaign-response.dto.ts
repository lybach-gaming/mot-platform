import { ApiProperty } from '@nestjs/swagger';
import { CampaignStatus } from '../../types/campaign.types';
import { TimePeriod } from '../../types/period.types';

export class CampaignPerformanceDto {
  @ApiProperty({ description: 'Campaign ID', example: 1 })
  campaignId: number;

  @ApiProperty({ description: 'Campaign name', example: 'Twitter Campaign Q2' })
  campaignName: string;

  @ApiProperty({ description: 'Campaign status', enum: CampaignStatus })
  status: CampaignStatus;

  @ApiProperty({ description: 'Total impressions', example: 15000 })
  impressions: number;

  @ApiProperty({ description: 'Total clicks', example: 3420 })
  clicks: number;

  @ApiProperty({ description: 'Total conversions', example: 156 })
  conversions: number;

  @ApiProperty({ description: 'Click-through rate (%)', example: 2.28 })
  ctr: number;

  @ApiProperty({ description: 'Conversion rate (%)', example: 4.56 })
  conversionRate: number;

  @ApiProperty({ description: 'Total revenue', example: 5850.00 })
  revenue: number;

  @ApiProperty({ description: 'Total commission', example: 585.00 })
  commission: number;

  @ApiProperty({ description: 'Return on investment (%)', example: 900.0 })
  roi: number;
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 50 })
  limit: number;

  @ApiProperty({ description: 'Total items', example: 120 })
  totalItems: number;

  @ApiProperty({ description: 'Total pages', example: 3 })
  totalPages: number;

  @ApiProperty({ description: 'Has next page', example: true })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Has previous page', example: false })
  hasPreviousPage: boolean;
}

export class CampaignResponseDto {
  @ApiProperty({ description: 'Campaign performance data', type: [CampaignPerformanceDto] })
  campaigns: CampaignPerformanceDto[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  meta: PaginationMetaDto;

  @ApiProperty({ description: 'Period analyzed', enum: TimePeriod })
  period: TimePeriod;

  @ApiProperty({ description: 'Date range', example: { from: '2024-01-01', to: '2024-01-31' } })
  dateRange: {
    from: string;
    to: string;
  };
}
