import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryLevelDetailDto {
  @ApiProperty()
  id!: number;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  language_id!: number;

  @ApiProperty()
  maincat_id!: number;

  @ApiProperty()
  main_subcat_id!: number;

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
  slug_subcategory?: string;

  @ApiProperty()
  web_seo?: any;

  @ApiProperty()
  faq?: any[];

  @ApiProperty()
  share_url?: string;
}
