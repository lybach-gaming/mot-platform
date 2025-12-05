import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  IsEnum,
  IsOptional,
  IsObject,
  ValidateNested,
  IsNumber,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { OfferTopic, OfferStatus } from '../../types';
import { CommissionModelDto } from './commission-model.dto';

export class CreateOfferDto {
  @ApiProperty({ example: 'Premium Membership' })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  name: string;

  @ApiProperty({ example: 'premium-membership' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Slug must contain only lowercase letters, numbers, and hyphens'
  })
  slug: string;

  @ApiProperty({ enum: OfferTopic, example: OfferTopic.SOFTWARE })
  @IsEnum(OfferTopic)
  topic: OfferTopic;

  @ApiProperty({ example: 'Get 30% recurring commission on all premium memberships' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    enum: OfferStatus,
    default: OfferStatus.DISABLED,
    required: false
  })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @ApiProperty({ required: false, example: 'Earn recurring commissions for lifetime of subscription' })
  @IsOptional()
  @IsString()
  commissionDescription?: string;

  @ApiProperty({ type: CommissionModelDto })
  @IsObject()
  @ValidateNested()
  @Type(() => CommissionModelDto)
  commissionModel: CommissionModelDto;

  @ApiProperty({ required: false, minimum: 1, maximum: 5, example: 4.8 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;
}
