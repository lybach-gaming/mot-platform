import { ApiProperty } from '@nestjs/swagger';

export class CoreMetricsDto {
  @ApiProperty({ description: 'Total revenue in USD', example: 58145.00 })
  totalRevenue: number;

  @ApiProperty({ description: 'Percentage change vs previous period', example: 12.5 })
  totalRevenueChangePct: number;

  @ApiProperty({ description: 'Average commission rate (%)', example: 8.2 })
  avgCommissionRatePct: number;

  @ApiProperty({ description: 'Commission rate change vs previous period', example: 2.1 })
  avgCommissionRateChangePct: number;

  @ApiProperty({ description: 'Conversion rate (%)', example: 9.0 })
  conversionRatePct: number;

  @ApiProperty({ description: 'Conversion rate change vs previous period', example: 8.0 })
  conversionRateChangePct: number;

  @ApiProperty({ description: 'Average order value (USD)', example: 145.20 })
  avgOrderValue: number;

  @ApiProperty({ description: 'Order value change vs previous period', example: -3.2 })
  avgOrderValueChangePct: number;
}

export class SummaryResponseDto {
  @ApiProperty({ description: 'Current period', example: 'last_30_days' })
  period: string;

  @ApiProperty({ description: 'Comparison period', example: 'previous_30_days' })
  comparisonPeriod: string;

  @ApiProperty({ description: 'Core metrics', type: CoreMetricsDto })
  metrics: CoreMetricsDto;
}
