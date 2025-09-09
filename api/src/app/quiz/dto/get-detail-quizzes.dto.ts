import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetDetailQuizzesDto {
  userId?: number | string | null;

  @ApiProperty({ description: 'Quiz ID', example: 1, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  id?: number;

  @ApiProperty({
    description: 'Quiz Slug',
    example: 'sample-quiz',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug_quizzes?: string;

  @ApiProperty({ description: 'Language ID', example: 14, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  language_id?: number;
}
