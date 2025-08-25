import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';
import { ToNumber } from '../../../common/decorators/to-number.decorator';
import { BasePaginationDto } from '../../../common/dto/base-pagination.dto';

export class GetListQuizDto extends BasePaginationDto {
  userId?: number;

  @ApiPropertyOptional({
    description: 'Search keyword',
    example: 'Quiz basics',
  })
  @IsOptional()
  @IsString({ message: 'Search must be a string' })
  search?: string;

  @ApiPropertyOptional({
    description: 'Language ID',
    example: 1,
  })
  @IsOptional()
  @ToNumber()
  @IsInt({ message: 'LanguageId must be an integer' })
  languageId?: number;

  @ApiPropertyOptional({
    description: 'Category ID',
    example: 2,
  })
  @IsOptional()
  @ToNumber()
  @IsInt({ message: 'CategoryId must be an integer' })
  categoryId?: number;

  @ApiPropertyOptional({
    description: 'Sub-category ID',
    example: 3,
  })
  @IsOptional()
  @ToNumber()
  @IsInt({ message: 'SubCategoryId must be an integer' })
  subCategoryId?: number;

  @ApiPropertyOptional({
    description: 'Sub-category level ID',
    example: 4,
  })
  @IsOptional()
  @ToNumber()
  @IsInt({ message: 'SubCategoryLevelId must be an integer' })
  subCategoryLevelId?: number;
}
