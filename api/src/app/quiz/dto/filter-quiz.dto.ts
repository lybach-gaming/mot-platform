import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Min, IsEnum, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { QuizSortBy } from '../../../common/constants/quiz';
import { OrderBy } from '../../../common/constants/app';

export class GetAllQuizzesDto {
  @ApiProperty({
    description: 'Number of quizzes per page',
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
    description: 'Search by quiz name or slug',
    example: 'electronics',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Field to sort by',
    example: QuizSortBy.ID,
    enum: QuizSortBy,
    type: String,
    required: false,
    default: QuizSortBy.ID,
  })
  @IsOptional()
  @IsEnum(QuizSortBy)
  sortBy?: QuizSortBy = QuizSortBy.ID;

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

  @ApiProperty({
    description: 'Filter by sub category level',
    example: 1,
    type: Number,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  subcategoryLevelId?: number;
}
