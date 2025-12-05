import { ApiProperty } from '@nestjs/swagger';
import { OfferTopic, OfferStatus, CommissionModel } from '../../types';

export class OfferResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Premium Membership' })
  name: string;

  @ApiProperty({ example: 'premium-membership' })
  slug: string;

  @ApiProperty({ enum: OfferTopic, example: OfferTopic.SOFTWARE })
  topic: OfferTopic;

  @ApiProperty({ example: 'Get 30% recurring commission on all premium memberships' })
  description: string;

  @ApiProperty({ enum: OfferStatus, example: OfferStatus.ACTIVE })
  status: OfferStatus;

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

export class OffersListResponseDto {
  @ApiProperty({ type: [OfferResponseDto] })
  offers: OfferResponseDto[];

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
