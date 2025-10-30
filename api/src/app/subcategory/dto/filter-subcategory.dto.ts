import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Min, IsEnum, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { SubcategorySortBy } from '../../../common/constants/subcategory';
import { OrderBy } from '../../../common/constants/app';

export class GetAllSubcategoriesDto {
  @ApiProperty({
    description: 'Number of subcategories per page',
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
    description: 'Search by subcategory name or slug',
    example: 'en',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Field to sort by',
    example: SubcategorySortBy.ID,
    enum: SubcategorySortBy,
    type: String,
    required: false,
    default: SubcategorySortBy.ID,
  })
  @IsOptional()
  @IsEnum(SubcategorySortBy)
  sortBy?: SubcategorySortBy = SubcategorySortBy.ID;

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
}
