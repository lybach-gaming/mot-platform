import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  Min,
  IsEnum,
  IsString,
  IsNumber,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { LanguageSortBy } from '../../../common/constants/language';
import { OrderBy } from '../../../common/constants/app';

export class GetAllLanguagesDto {
  @ApiProperty({
    description: 'Number of languages per page',
    example: 20,
    type: Number,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiProperty({
    description: 'Number of items to skip',
    example: 0,
    type: Number,
    required: false,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({
    description: 'Search by language name or code',
    example: 'en',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Field to sort by',
    example: LanguageSortBy.ID,
    enum: LanguageSortBy,
    type: String,
    required: false,
    default: LanguageSortBy.ID,
  })
  @IsOptional()
  @IsEnum(LanguageSortBy)
  sortBy?: LanguageSortBy = LanguageSortBy.ID;

  @ApiProperty({
    description: 'Sorting direction',
    example: OrderBy.DESC,
    enum: OrderBy,
    type: String,
    required: false,
    default: OrderBy.DESC,
  })
  @IsOptional()
  @IsEnum(OrderBy)
  order?: OrderBy = OrderBy.DESC;

  @ApiProperty({
    description: 'Filter by status (0 = Disabled, 1 = Enabled)',
    example: 1,
    enum: [0, 1],
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  @Type(() => Number)
  status?: number;

  @ApiProperty({
    description: 'Filter by type (0 = Inactive, 1 = Active)',
    example: 1,
    enum: [0, 1],
    type: Number,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsIn([0, 1])
  @Type(() => Number)
  type?: number;
}
