import { ApiProperty } from '@nestjs/swagger';

export class TrendDataPointDto {
  @ApiProperty({ description: 'Month (YYYY-MM)', example: '2025-01' })
  month: string;

  @ApiProperty({ description: 'Earnings in USD', example: 4500 })
  earningsUsd: number;

  @ApiProperty({ description: 'Number of conversions', example: 120 })
  conversions: number;
}

export class TrendResponseDto {
  @ApiProperty({ description: 'Time series data', type: [TrendDataPointDto] })
  series: TrendDataPointDto[];
}
