import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Min, IsEnum, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { SubcategoryLevelSortBy } from '../../../common/constants/subcategory-level';
import { OrderBy } from '../../../common/constants/app';

export class GetAllSubcategoryLevelsDto {
  @ApiProperty({
    description: 'Number of subcategory levels per page',
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
    description: 'Search by subcategory level name or slug',
    example: 'electronics',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Field to sort by',
    example: SubcategoryLevelSortBy.ID,
    enum: SubcategoryLevelSortBy,
    type: String,
    required: false,
    default: SubcategoryLevelSortBy.ID,
  })
  @IsOptional()
  @IsEnum(SubcategoryLevelSortBy)
  sortBy?: SubcategoryLevelSortBy = SubcategoryLevelSortBy.ID;

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
    description: 'Filter by main category',
    example: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiProperty({
    description: 'Filter by sub category',
    example: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subcategoryId?: number;
}
