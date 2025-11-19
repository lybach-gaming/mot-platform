import { ApiProperty } from '@nestjs/swagger';

export class LeaderboardEntryDto {
  @ApiProperty({
    description: 'Rank position on the leaderboard',
    example: 1,
    type: Number
  })
  rank: number;

  @ApiProperty({
    description: 'Affiliate user ID',
    example: 123,
    type: Number
  })
  affiliateId: number;

  @ApiProperty({
    description: 'Affiliate display name or username',
    example: 'CryptoKing',
    type: String,
    nullable: true
  })
  name: string | null;

  @ApiProperty({
    description: 'Affiliate wallet address',
    example: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    type: String,
    nullable: true
  })
  address: string | null;

  @ApiProperty({
    description: 'Total referral count',
    example: 245,
    type: Number
  })
  totalReferrals: number;

  @ApiProperty({
    description: 'Total conversion count',
    example: 189,
    type: Number
  })
  totalConversions: number;

  @ApiProperty({
    description: 'Total earnings in USD',
    example: 8765.43,
    type: Number
  })
  earnings: number;

  @ApiProperty({
    description: 'Account status',
    example: 'Active',
    enum: ['Active', 'Inactive'],
    type: String
  })
  status: 'Active' | 'Inactive';

  @ApiProperty({
    description: 'Formatted earnings display',
    example: '$8,765.43',
    type: String
  })
  earningsDisplay: string;
}
