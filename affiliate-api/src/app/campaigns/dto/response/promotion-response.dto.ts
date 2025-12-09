import { ApiProperty } from '@nestjs/swagger';

export class PromotionResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Campaign promotion registered successfully' })
  message: string;

  @ApiProperty({ example: 1 })
  campaignId: number;

  @ApiProperty({ example: 'Premium Membership' })
  campaignName: string;

  @ApiProperty({ example: '2024-01-15T10:00:00Z' })
  promotedAt: Date;

  @ApiProperty({ required: false, example: 'email' })
  channel?: string;
}
