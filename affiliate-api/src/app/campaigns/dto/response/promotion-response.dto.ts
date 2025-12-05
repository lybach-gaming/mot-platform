import { ApiProperty } from '@nestjs/swagger';

export class PromotionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Offer promotion registered successfully' })
  message: string;

  @ApiProperty({ example: 1 })
  offerId: number;

  @ApiProperty({ example: 'Premium Membership' })
  offerName: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  promotedAt: Date;

  @ApiProperty({ required: false, example: 'email' })
  channel?: string;
}
