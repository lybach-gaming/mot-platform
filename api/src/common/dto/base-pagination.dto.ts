import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ToNumber } from '../decorators/to-number.decorator';

export class BasePaginationDto {
  @ApiPropertyOptional({
    description: 'Number of items return',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @ToNumber()
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be greater than or equal to 1' })
  limit = 10;

  @ApiPropertyOptional({
    description: 'Current offset',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @ToNumber()
  @IsInt({ message: 'Offset must be an integer' })
  @Min(0, { message: 'Offset must be greater than or equal to 1' })
  offset = 0;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'created_at',
    default: 'created_at',
  })
  @IsOptional()
  @IsString({ message: 'SortBy must be a string' })
  sortBy = 'id';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'SortOrder must be either asc or desc' })
  sortOrder: 'asc' | 'desc' = 'desc';
}
