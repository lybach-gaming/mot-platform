import { ApiProperty } from '@nestjs/swagger';

export class FunnelStageDto {
  @ApiProperty({ description: 'Stage name', example: 'Impressions' })
  name: string;

  @ApiProperty({ description: 'Count at this stage', example: 24500 })
  count: number;

  @ApiProperty({ description: 'Percentage of funnel top', example: 100.0 })
  percent: number;
}

export class FunnelResponseDto {
  @ApiProperty({ description: 'Period analyzed', example: 'last_30_days' })
  period: string;

  @ApiProperty({ description: 'Funnel stages', type: [FunnelStageDto] })
  stages: FunnelStageDto[];

  @ApiProperty({ description: 'Overall conversion rate (%)', example: 1.57 })
  conversionRatePct: number;
}
