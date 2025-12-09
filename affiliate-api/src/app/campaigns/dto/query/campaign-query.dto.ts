import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { CampaignStatus, CampaignTopic } from '../../types';

export enum CampaignSortField {
  RATING = 'rating',
  ACTIVE_AFFILIATES = 'activeAffiliates',
  NAME = 'name',
  CREATED_AT = 'createdAt'
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC'
}

export class CampaignQueryDto {
  @ApiProperty({
    required: false,
    enum: CampaignStatus,
    description: 'Filter by campaign status'
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @ApiProperty({
    required: false,
    enum: CampaignTopic,
    description: 'Filter by campaign topic'
  })
  @IsOptional()
  @IsEnum(CampaignTopic)
  topic?: CampaignTopic;

  @ApiProperty({
    required: false,
    minimum: 1,
    maximum: 5,
    description: 'Minimum rating filter'
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiProperty({
    required: false,
    default: 1,
    minimum: 1,
    description: 'Page number for pagination'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    required: false,
    default: 20,
    minimum: 1,
    maximum: 100,
    description: 'Number of items per page'
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;

  @ApiProperty({
    required: false,
    enum: CampaignSortField,
    default: CampaignSortField.RATING,
    description: 'Sort field'
  })
  @IsOptional()
  @IsEnum(CampaignSortField)
  sortBy?: CampaignSortField = CampaignSortField.RATING;

  @ApiProperty({
    required: false,
    enum: SortOrder,
    default: SortOrder.DESC,
    description: 'Sort order'
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
