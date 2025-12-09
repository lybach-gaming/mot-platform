import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetaDto } from './campaign-response.dto';
import { TimePeriod } from '../../types/period.types';

export class CountryPerformanceDto {
  @ApiProperty({ description: 'Country code (ISO 3166-1 alpha-2)', example: 'US' })
  country: string;

  @ApiProperty({ description: 'Country name', example: 'United States' })
  countryName: string;

  @ApiProperty({ description: 'Total clicks', example: 12450 })
  clicks: number;

  @ApiProperty({ description: 'Total conversions', example: 245 })
  conversions: number;

  @ApiProperty({ description: 'Conversion rate (%)', example: 1.97 })
  conversionRate: number;

  @ApiProperty({ description: 'Total revenue', example: 18500.00 })
  revenue: number;

  @ApiProperty({ description: 'Total commission', example: 1850.00 })
  commission: number;
}

export class GeographyResponseDto {
  @ApiProperty({ description: 'Country performance data', type: [CountryPerformanceDto] })
  countries: CountryPerformanceDto[];

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
