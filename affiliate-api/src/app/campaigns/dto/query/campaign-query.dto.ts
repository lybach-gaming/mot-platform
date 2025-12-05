import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { OfferStatus, OfferTopic } from '../../types';

export class OfferQueryDto {
  @ApiProperty({
    required: false,
    enum: OfferStatus,
    description: 'Filter by offer status'
  })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @ApiProperty({
    required: false,
    enum: OfferTopic,
    description: 'Filter by offer topic'
  })
  @IsOptional()
  @IsEnum(OfferTopic)
  topic?: OfferTopic;

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
    enum: ['rating', 'activeAffiliates', 'name', 'createdAt'],
    default: 'rating',
    description: 'Sort field'
  })
  @IsOptional()
  sortBy?: 'rating' | 'activeAffiliates' | 'name' | 'createdAt' = 'rating';

  @ApiProperty({
    required: false,
    enum: ['ASC', 'DESC'],
    default: 'DESC',
    description: 'Sort order'
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
