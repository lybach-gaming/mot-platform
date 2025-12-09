import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject, IsEnum, MaxLength } from 'class-validator';

export enum PromotionChannel {
  EMAIL = 'email',
  SOCIAL_MEDIA = 'social_media',
  BLOG = 'blog',
  WEBSITE = 'website',
  VIDEO = 'video',
  PODCAST = 'podcast',
  PAID_ADS = 'paid_ads',
  OTHER = 'other'
}

export class PromoteCampaignDto {
  @ApiProperty({
    required: false,
    enum: PromotionChannel,
    example: PromotionChannel.EMAIL,
    description: 'Channel through which the campaign is promoted'
  })
  @IsOptional()
  @IsEnum(PromotionChannel)
  channel?: PromotionChannel;

  @ApiProperty({ required: false, type: 'object', example: { campaign: 'homepage_banner' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
