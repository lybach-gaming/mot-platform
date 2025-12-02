import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsEnum, IsIn } from 'class-validator';
import { PeriodQueryDto } from './period-query.dto';
import { CampaignStatus } from '../../types';

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
    enum: ['clicks', 'conversions', 'revenue', 'roi'],
    required: false,
    default: 'revenue'
  })
  @IsOptional()
  @IsIn(['clicks', 'conversions', 'revenue', 'roi'])
  sortBy?: string = 'revenue';

  @ApiProperty({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    required: false,
    default: 'desc'
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  @ApiProperty({
    description: 'Filter by campaign status',
    enum: CampaignStatus,
    required: false
  })
  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;
}
