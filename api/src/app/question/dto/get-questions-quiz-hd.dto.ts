import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetQuestionsQuizHdDto {
  userId?: number | string | null;
  firebaseId?: string | null;

  @ApiProperty({ description: 'Language ID', example: 14, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  language_id?: number;

  @ApiProperty({ description: 'Category ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  category?: number;

  @ApiProperty({ description: 'Sub Category ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sub_cat?: number;

  @ApiProperty({
    description: 'Sub Category Level',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sub_cat_level?: number;

  @ApiProperty({ description: 'Quiz ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quizzes?: number;
}
