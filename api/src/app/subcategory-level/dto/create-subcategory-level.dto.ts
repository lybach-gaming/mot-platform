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

export class CreateSubcategoryLevelDto {
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

  @ApiProperty({ description: 'The language ID for the subcategory level' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  language_id!: number;

  @ApiProperty({ description: 'The main category ID of the subcategory level' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  maincat_id!: number;

  @ApiProperty({
    description: 'The main subcategory ID of the subcategory level',
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  main_subcat_id!: number;

  @ApiProperty({ description: 'The name of the subcategory level' })
  @IsString()
  @IsNotEmpty()
  subcategory_level_name!: string;

  @ApiProperty({
    description: 'Image URI for the subcategory level',
    type: 'string',
    default: '',
    required: false,
  })
  @IsOptional()
  image?: string;

  @ApiProperty({
    description: 'The status of the subcategory level',
    default: 1,
    example: '1=Active, 0=Deactive',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  status?: number = 1;

  @ApiProperty({
    description: 'Whether the subcategory level is premium',
    default: 1,
    example: '0=no, 1=yes',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  is_premium?: number = 1;

  @ApiProperty({
    description: 'The coins required/rewarded for the subcategory level',
    default: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  coins?: number = 0;

  @ApiProperty({
    description: 'The order of the subcategory level in listing',
    default: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  row_order?: number = 0;

  @ApiProperty({
    description: 'The URL-friendly slug for the subcategory level',
  })
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @ApiProperty({
    description: 'Whether FAQ is enabled for this subcategory level',
    default: 1,
    example: '0=no, 1=yes',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  enable_faq?: number = 1;

  @ApiProperty({ description: 'FAQ questions array', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  questions?: string[];

  @ApiProperty({ description: 'FAQ answers array', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  answers?: string[];

  @ApiProperty({
    description: 'The difficulty level of the subcategory level',
    default: 0,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  level?: number = 0;

  @ApiProperty({
    description: 'Whether the subcategory level is coming soon',
    default: 0,
    example: '0=no, 1=yes',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  is_coming_soon?: number = 0;

  @ApiProperty({ description: 'SEO information for the subcategory level' })
  @ValidateNested()
  @Type(() => WebSeoDto)
  @IsOptional()
  web_seo?: WebSeoDto;
}
