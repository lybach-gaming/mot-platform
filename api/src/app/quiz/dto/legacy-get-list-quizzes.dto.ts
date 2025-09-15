import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class LegacyGetListQuizDto {
  // User ID
  user_id?: number;

  @ApiProperty({ description: 'Language ID', required: true })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  language_id!: number;

  @ApiProperty({
    description: 'Category ID',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  category!: number;

  @ApiProperty({
    description: 'Subcategory ID',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  sub_cat!: number;

  @ApiProperty({ description: 'Subcategory Level ID', required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sub_cat_level?: number;

  @ApiProperty({
    description: 'Is Pined',
    required: false,
    example: '0=Not pinned, 1=Pinned',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  is_pinned?: number;

  @ApiProperty({ description: 'Search term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 0;

  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  offset?: number = 0;
}
