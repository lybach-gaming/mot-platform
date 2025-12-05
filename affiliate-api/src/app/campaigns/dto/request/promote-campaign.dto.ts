import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject } from 'class-validator';

export class PromoteCampaignDto {
  @ApiProperty({ required: false, example: 'email' })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiProperty({ required: false, type: 'object', example: { campaign: 'homepage_banner' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
