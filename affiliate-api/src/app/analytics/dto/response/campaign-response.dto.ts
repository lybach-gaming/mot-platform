import { ApiProperty } from '@nestjs/swagger';

export class CampaignPerformanceDto {
  @ApiProperty({ description: 'Campaign ID', example: 1 })
  campaignId: number;

  @ApiProperty({ description: 'Campaign name', example: 'Twitter Campaign Q2' })
  campaignName: string;

  @ApiProperty({ description: 'Total clicks', example: 3420 })
  clicks: number;

  @ApiProperty({ description: 'Total conversions', example: 156 })
  conversions: number;

  @ApiProperty({ description: 'Revenue in USD', example: 5850.00 })
  revenueUsd: number;

  @ApiProperty({ description: 'ROI percentage', example: 285.5 })
  roiPct: number;

  @ApiProperty({ description: 'Campaign status', example: 'active' })
  status: string;
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Current page', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items per page', example: 50 })
  limit: number;

  @ApiProperty({ description: 'Total items', example: 120 })
  total: number;

  @ApiProperty({ description: 'Total pages', example: 3 })
  totalPages: number;

  @ApiProperty({ description: 'Has next page', example: true })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Has previous page', example: false })
  hasPrevPage: boolean;
}

export class CampaignResponseDto {
  @ApiProperty({ description: 'Period analyzed', example: 'last_30_days' })
  period: string;

  @ApiProperty({ description: 'Campaign performance data', type: [CampaignPerformanceDto] })
  items: CampaignPerformanceDto[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
