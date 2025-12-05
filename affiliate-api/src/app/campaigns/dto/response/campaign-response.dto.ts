import { ApiProperty } from '@nestjs/swagger';
import { CampaignTopic, CampaignStatus, CommissionModel } from '../../types';

export class CampaignResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Premium Membership' })
  name: string;

  @ApiProperty({ example: 'premium-membership' })
  slug: string;

  @ApiProperty({ enum: CampaignTopic, example: CampaignTopic.SOFTWARE })
  topic: CampaignTopic;

  @ApiProperty({ example: 'Get 30% recurring commission on all premium memberships' })
  description: string;

  @ApiProperty({ enum: CampaignStatus, example: CampaignStatus.ACTIVE })
  status: CampaignStatus;

  @ApiProperty({ required: false, example: 'Earn recurring commissions for lifetime of subscription' })
  commissionDescription?: string;

  @ApiProperty({ type: 'object' })
  commissionModel: CommissionModel;

  @ApiProperty({ required: false, example: 4.8 })
  rating?: number;

  @ApiProperty({ example: 245 })
  activeAffiliates: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-15T00:00:00Z' })
  updatedAt: Date;
}

export class CampaignsListResponseDto {
  @ApiProperty({ type: [CampaignResponseDto] })
  campaigns: CampaignResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 100 })
  totalItems: number;

  @ApiProperty({ example: 5 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;
}
