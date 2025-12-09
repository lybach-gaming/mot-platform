import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsEnum } from 'class-validator';
import { PeriodQueryDto } from './period-query.dto';
import { CampaignStatus } from '../../types';

export enum SortByField {
  CLICKS = 'clicks',
  CONVERSIONS = 'conversions',
  REVENUE = 'revenue',
  ROI = 'roi'
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc'
}

export class CampaignQueryDto extends PeriodQueryDto {
  @ApiProperty({
    description: 'Page number (1-based)',
    example: 1,
    required: false,
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of entries per page',
    example: 50,
    required: false,
    default: 50,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiProperty({
    description: 'Sort by field',
    enum: SortByField,
    required: false,
    default: SortByField.REVENUE
  })
  @IsOptional()
  @IsEnum(SortByField)
  sortBy?: SortByField = SortByField.REVENUE;

  @ApiProperty({
    description: 'Sort order',
    enum: SortOrder,
    required: false,
    default: SortOrder.DESC
  })
  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder = SortOrder.DESC;

  @ApiProperty({
    description: 'Filter by campaign status',
    enum: CampaignStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
