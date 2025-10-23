import { IsString, IsNumber, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CheckSlugDto {
  @ApiProperty({
    description: 'The URL-friendly slug to check',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  slug!: string;

  @ApiProperty({
    description:
      'The ID to exclude from the check: useful for updates (Web SEO ID, Blog ID, Blog Category ID)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  excludeId?: number;
}
