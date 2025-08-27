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

export class CreateSubcategoryDto {
  @ApiProperty({ type: 'string', format: 'binary', required: false })
  image_file?: Express.Multer.File;

  @ApiProperty({
    description: 'Quiz mode',
    example:
      '1 - quizz hd, 2 - fund n learn, 3 - guess the word, 4 - audio question, 5 - math mania, 6 - true false, 7 - daily quizz, 8 - contest, 9 - exam, 10 - battle 1x1, 11 - battle group, 12 - quizz by lanugage, 15 - common page',
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  quiz_mode!: number;

  @ApiProperty({ description: 'The language ID for the subcategory' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  language_id!: number;

  @ApiProperty({ description: 'The main category ID of the subcategory' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  maincat_id!: number;


  @ApiProperty({ description: 'The name of the subcategory' })
  @IsString()
  @IsNotEmpty()
  subcategory_name!: string;

  @ApiProperty({
    description: 'Image file for the subcategory',
    type: 'string',
    format: 'binary',
  })
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'The status of the subcategory',
    default: 1,
    example: '1=Active, 0=Deactive',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  status?: number = 1;

  @ApiProperty({
    description: 'Whether the subcategory is premium',
    default: 1,
    example: '0=no, 1=yes',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  is_premium?: number = 1;

  @ApiProperty({
    description: 'The coins required/rewarded for the subcategory',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  coins?: number = 0;

  @ApiProperty({
    description: 'The order of the subcategory in listing',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  row_order?: number = 0;

  @ApiProperty({
    description: 'The URL-friendly slug for the subcategory',
  })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({
    description: 'Whether FAQ is enabled for this subcategory',
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
    description: 'The difficulty level of the subcategory',
    default: 0,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  level?: number = 0;

  @ApiProperty({
    description: 'Whether the subcategory is coming soon',
    default: 0,
    example: '0=no, 1=yes',
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  is_coming_soon?: number = 0;

  @ApiProperty({ description: 'SEO information for the subcategory' })
  @ValidateNested()
  @Type(() => WebSeoDto)
  @IsOptional()
  web_seo?: WebSeoDto;
}
