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
import { CategorySortBy } from '../../../common/constants/category';
import { OrderBy } from '../../../common/constants/app';

export class GetAllCategoriesDto {
  @ApiProperty({
    description: 'Number of categories per page',
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
    description: 'Search by category name or slug',
    example: 'electronics',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Field to sort by',
    example: CategorySortBy.ID,
    enum: CategorySortBy,
    type: String,
    required: false,
    default: CategorySortBy.ID,
  })
  @IsOptional()
  @IsEnum(CategorySortBy)
  sortBy?: CategorySortBy = CategorySortBy.ID;

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
    description: 'Filter by language',
    example: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  languageId?: number;

  @ApiProperty({
    description: 'Filter by type (game modes)',
    example: 1,
    enum: [1, 2, 3, 4, 5, 6], // 1 - quizz hd, 2 - fund n learn, 3 - guess the word, 4 - audio question, 5 - math mania, 6 - true false
    type: Number,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsIn([1, 2, 3, 4, 5, 6])
  type?: number;
}
