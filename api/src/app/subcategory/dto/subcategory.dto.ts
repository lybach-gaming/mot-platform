import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryDetailDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  language_id!: number;

  @ApiProperty()
  maincat_id!: number;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  image!: string;

  @ApiProperty()
  thumb_image!: string;

  @ApiProperty()
  row_order!: number;

  @ApiProperty()
  status!: number;

  @ApiProperty()
  slug_category?: string;

  @ApiProperty()
  web_seo?: any;

  @ApiProperty()
  faq?: any[];

  @ApiProperty()
  share_url?: string;
}
