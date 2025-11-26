import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from './campaign-response.dto';

export class GeographyPerformanceDto {
  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)', example: 'US' })
  country: string;

  @ApiProperty({ description: 'Country name', example: 'United States' })
  countryName: string;

  @ApiProperty({ description: 'Flag identifier', example: 'us' })
  flag: string;

  @ApiProperty({ description: 'Total clicks', example: 12450 })
  clicks: number;

  @ApiProperty({ description: 'Total conversions', example: 245 })
  conversions: number;

  @ApiProperty({ description: 'Revenue in USD', example: 18500.00 })
  revenueUsd: number;

  @ApiProperty({ description: 'Conversion rate (%)', example: 2.0 })
  conversionRatePct: number;
}

export class GeographyResponseDto {
  @ApiProperty({ description: 'Period analyzed', example: 'last_30_days' })
  period: string;

  @ApiProperty({ description: 'Geographic performance data', type: [GeographyPerformanceDto] })
  items: GeographyPerformanceDto[];

  @ApiProperty({ description: 'Pagination metadata', type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}
