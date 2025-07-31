import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { WebSeoDto } from '../../web-seo/dto/web-seo.dto';

export class CreateQuizDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image_file?: Express.Multer.File;

  @ApiProperty({ description: 'The language ID for the quiz' })
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
  quiz_mode: number;

  @ApiProperty({ description: 'The main category ID of the quiz' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  maincat_id: number;

  @ApiProperty({ description: 'The main subcategory ID of the quiz' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  main_subcat_id: number;

  @ApiProperty({ description: 'The main subcategory level ID of the quiz' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  main_subcat_level_id?: number;

  @ApiProperty({ description: 'The name of the quiz' })
  @IsString()
  @IsNotEmpty()
  quizz_name: string;

  @ApiProperty({
    description: 'Image file for the quiz',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'The status of the quiz',
    default: 1,
    example: '1=Active, 0=Deactive',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  status?: number = 1;

  @ApiProperty({
    description: 'Whether the quiz is premium',
    default: 1,
    example: '0=no, 1=yes',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  is_premium?: number = 1;

  @ApiProperty({
    description: 'The coins required/rewarded for the quiz',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  coins?: number = 0;

  @ApiProperty({ description: 'The order of the quiz in listing', default: 0 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  row_order?: number = 0;

  @ApiProperty({ description: 'The URL-friendly slug for the quiz' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({
    description: 'Whether FAQ is enabled for this quiz',
    default: 1,
    example: '0=no, 1=yes',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  enable_faq?: number = 1;

  @ApiProperty({ description: 'FAQ questions array' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  questions?: string[];

  @ApiProperty({ description: 'FAQ answers array' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  answers?: string[];

  @ApiProperty({
    description: 'Whether the quiz is public',
    default: 1,
    example: '0=no, 1=yes',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  is_public?: number = 1;

  @ApiProperty({ description: 'The difficulty level of the quiz', default: 0 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  level?: number = 0;

  @ApiProperty({
    description: 'Whether the quiz is featured',
    default: 0,
    example: '0=no, 1=yes',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  is_featured?: number = 0;

  @ApiProperty({
    description: 'Whether the quiz is coming soon',
    default: 0,
    example: '0=no, 1=yes',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  is_coming_soon?: number = 0;

  @ApiProperty({
    description: 'Whether the quiz is pinned',
    default: 0,
    example: '0=not pin, 1=pinned',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  is_pinned?: number = 0;

  @ApiProperty({
    description: 'Whether to send notification after creating quiz',
    default: 0,
    example: '0=not send, 1=send',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  is_send_notice?: number = 0;

  @ApiProperty({ description: 'SEO information for the quiz' })
  @ValidateNested()
  @Type(() => WebSeoDto)
  @IsOptional()
  web_seo?: WebSeoDto;
}
