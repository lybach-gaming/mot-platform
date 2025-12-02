import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsIn } from 'class-validator';
import { PeriodQueryDto } from './period-query.dto';

export class GeographyQueryDto extends PeriodQueryDto {
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
    example: 100,
    required: false,
    default: 100,
    minimum: 1,
    maximum: 200
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 100;

  @ApiProperty({
    description: 'Sort by field',
    enum: ['clicks', 'conversions', 'revenue', 'conversionRate'],
    required: false,
    default: 'revenue'
  })
  @IsOptional()
  @IsIn(['clicks', 'conversions', 'revenue', 'conversionRate'])
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
}
