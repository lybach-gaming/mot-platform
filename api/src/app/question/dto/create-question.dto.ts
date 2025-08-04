import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateQuestionDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image_file?: Express.Multer.File;

  @ApiProperty({ description: 'The language ID for the question' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  language_id: number;

  @ApiProperty({ description: 'The main category ID of the question' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  category: number;

  @ApiProperty({ description: 'The main subcategory ID of the question' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  subcategory: number;

  @ApiProperty({ description: 'The main subcategory level ID of the question' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  subcategory_level?: number;

  @ApiProperty({ description: 'The quiz ID of the question' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  quizzes: number;

  @ApiProperty({
    description: 'Image file for the quiz',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image?: string;

  @ApiProperty({ description: 'The content of the question' })
  @IsString()
  @IsNotEmpty()
  question: string;

  @ApiProperty({
    description: 'The type of the question',
    default: 1,
    example: '1=Normal, 2=True/False',
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  question_type?: number = 1;

  // Options for the question
  @ApiProperty({ description: 'Option A of the question' })
  @IsString()
  @IsNotEmpty()
  optiona: string;

  @ApiProperty({ description: 'Option B of the question' })
  @IsString()
  @IsNotEmpty()
  optionb: string;

  @ApiProperty({ description: 'Option C of the question', default: '' })
  @IsString()
  @IsNotEmpty()
  optionc?: string = '';

  @ApiProperty({ description: 'Option D of the question', default: '' })
  @IsString()
  @IsNotEmpty()
  optiond?: string = '';

  @ApiProperty({ description: 'Option E of the question', required: false })
  @IsString()
  @IsOptional()
  optione?: string;

  @ApiProperty({ description: 'The correct answer of the question' })
  @IsString()
  @IsNotEmpty()
  answer: string;

  @ApiProperty({
    description: 'Whether the question is public',
    default: 1,
    example: '0=no, 1=yes',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  is_public?: number = 1;

  @ApiProperty({ description: 'The note of the question', default: '' })
  @IsString()
  @IsOptional()
  note?: string = '';

  @ApiProperty({
    description: 'The difficulty level of the question',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  level?: number = 0;
}
