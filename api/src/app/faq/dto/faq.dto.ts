import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class FaqDto {
  @ApiProperty({ description: 'Question for the FAQ' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({ description: 'Answer for the FAQ' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({ description: 'Language ID' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  language_id: number;

  @ApiProperty({
    description: 'Quiz mode',
    example:
      '1 - quizz hd, 2 - fund n learn, 3 - guess the word, 4 - audio question, 5 - math mania, 6 - true false, 7 - daily quizz, 8 - contest, 9 - exam, 10 - battle 1x1, 11 - battle group, 12 - quizz by lanugage, 15 - common page',
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  quizz_mode: number;

  @ApiProperty({
    description: 'Type',
    example:
      '0 - all cat, 1 - cat, 2 - subcat, 3 - subcat_level, 4 - quizzes, 5 - common, 6 - quizz by language lan',
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  type: number;

  @ApiProperty({ description: 'Quiz by Language category ID' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quizz_by_language_lan_id?: number;

  @ApiProperty({ description: 'Main category ID' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maincat_id?: number;

  @ApiProperty({ description: 'Subcategory ID' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  subcategory_id?: number;

  @ApiProperty({ description: 'Subcategory level ID' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  subcategory_level_id?: number;

  @ApiProperty({ description: 'Quizz ID' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quizz_id?: number;

  @ApiProperty({ description: 'FAQ check', default: 1, example: '0=no, 1=yes' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  enable_faq?: number = 1;
}
