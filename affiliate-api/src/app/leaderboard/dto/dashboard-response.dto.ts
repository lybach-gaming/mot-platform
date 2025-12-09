import { ApiProperty } from '@nestjs/swagger';

export class DashboardRankDto {
  @ApiProperty({
    description: 'Current rank position',
    example: 15,
    type: Number
  })
  rank: number;

  @ApiProperty({
    description: 'Percentile position among all affiliates',
    example: 8.5,
    type: Number
  })
  percentile: number;

  @ApiProperty({
    description: 'Formatted rank display',
    example: '#15',
    type: String
  })
  display: string;

  @ApiProperty({
    description: 'Percentile display text',
    example: 'Top 8.5% of affiliates',
    type: String
  })
  percentileDisplay: string;
}

export class DashboardReferralsDto {
  @ApiProperty({
    description: 'Total referral count',
    example: 142,
    type: Number
  })
  total: number;

  @ApiProperty({
    description: 'Weekly change in referrals',
    example: 5,
    type: Number
  })
  weeklyChange: number;

  @ApiProperty({
    description: 'Formatted weekly change display',
    example: '+5 this week',
    type: String
  })
  weeklyChangeDisplay: string;
}

export class DashboardConversionsDto {
  @ApiProperty({
    description: 'Total conversion count',
    example: 87,
    type: Number
  })
  total: number;

  @ApiProperty({
    description: 'Conversion rate percentage',
    example: 61.27,
    type: Number
  })
  conversionRate: number;

  @ApiProperty({
    description: 'Formatted conversion rate display',
    example: '61.27%',
    type: String
  })
  conversionRateDisplay: string;
}

export class DashboardEarningsDto {
  @ApiProperty({
    description: 'Total earnings in USD',
    example: 3456.78,
    type: Number
  })
  total: number;

  @ApiProperty({
    description: 'Monthly change in earnings',
    example: 250,
    type: Number
  })
  monthlyChange: number;

  @ApiProperty({
    description: 'Formatted earnings display',
    example: '$3,456.78',
    type: String
  })
  totalDisplay: string;

  @ApiProperty({
    description: 'Formatted monthly change display',
    example: '+$250.00 this month',
    type: String
  })
  monthlyChangeDisplay: string;
}

export class DashboardResponseDto {
  @ApiProperty({
    description: 'User rank information',
    type: DashboardRankDto
  })
  rank: DashboardRankDto;

  @ApiProperty({
    description: 'User referral statistics',
    type: DashboardReferralsDto
  })
  referrals: DashboardReferralsDto;

  @ApiProperty({
    description: 'User conversion statistics',
    type: DashboardConversionsDto
  })
  conversions: DashboardConversionsDto;

  @ApiProperty({
    description: 'User earnings statistics',
    type: DashboardEarningsDto
  })
  earnings: DashboardEarningsDto;
}
