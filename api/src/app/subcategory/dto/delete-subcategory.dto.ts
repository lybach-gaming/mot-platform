import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteSubcategoriesDto {
  @ApiProperty({
    description: 'List of subcategory IDs to delete',
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  ids!: number[];
}
