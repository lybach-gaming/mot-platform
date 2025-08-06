import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class WebSeoDto {
  @ApiProperty({ description: 'Language ID' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  language_id?: number;

  @ApiProperty({
    description: 'Quiz mode',
    example:
      '1 - quizz hd, 2 - fund n learn, 3 - guess the word, 4 - audio question, 5 - math mania, 6 - true false, 7 - daily quizz, 8 - contest, 9 - exam, 10 - battle 1x1, 11 - battle group, 12 - quizz by lanugage, 15 - common page',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quizz_mode?: number;

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

  @ApiProperty({ description: 'Quiz ID' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  quizz_id?: number;

  @ApiProperty({
    description: 'Type',
    example:
      '0 - all cat, 1 - cat, 2 - subcat, 3 - subcat_level, 4 - quizzes, 5 - common, 6 - quizz by language lan',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  type?: number;

  @ApiProperty({
    description: 'SEO title, defaults to quiz name if not provided',
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'SEO slug, used for URL generation',
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({ description: 'SEO subtitle', default: '' })
  @IsString()
  @IsOptional()
  sub_title?: string = '';

  @ApiProperty({ description: 'SEO sub heading', default: '' })
  @IsString()
  @IsOptional()
  sub_heading?: string = '';

  @ApiProperty({ description: 'Sponsor link', default: '' })
  @IsString()
  @IsOptional()
  sponsor_link?: string = '';

  @ApiProperty({ description: 'Sponsor name', default: '' })
  @IsString()
  @IsOptional()
  sponsor_name?: string = '';

  @ApiProperty({ description: 'Meta title for SEO', default: '' })
  @IsString()
  @IsOptional()
  meta_title?: string = '';

  @ApiProperty({ description: 'Meta description for SEO', default: '' })
  @IsString()
  @IsOptional()
  meta_description?: string = '';

  @ApiProperty({ description: 'Meta keywords for SEO', default: '' })
  @IsString()
  @IsOptional()
  meta_keyword?: string = '';

  @ApiProperty({ description: 'Schema markup for SEO' })
  @IsString()
  @IsOptional()
  schema_markup?: string = '';

  @ApiProperty({ description: 'SEO block content', default: '' })
  @IsString()
  @IsOptional()
  seo_block?: string = '';

  @ApiProperty({ description: 'Description for SEO', default: '' })
  @IsString()
  @IsOptional()
  description?: string = '';

  @ApiProperty({
    description: 'Is Edit Slug SEO',
    default: 1,
    example: '0=no, 1=yes',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  is_edit_slug?: number = 1;

  @ApiProperty({ description: 'SEO Heading', defult: '' })
  @IsString()
  @IsOptional()
  heading?: string = '';

  @ApiProperty({ description: 'FAQ check', default: 1, example: '0=no, 1=yes' })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  enable_faq?: number = 1;
}
