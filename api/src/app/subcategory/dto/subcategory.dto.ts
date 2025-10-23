import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryDetailDto {
  @ApiProperty({
    description: 'Unique identifier for the subcategory',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Name of the subcategory',
    example: 'Physics',
  })
  name!: string;

  @ApiProperty({
    description: 'Language ID associated with the subcategory',
    example: 1,
  })
  language_id!: number;

  @ApiProperty({
    description: 'Main category ID associated with the subcategory',
    example: 1,
  })
  maincat_id!: number;

  @ApiProperty({
    description: 'Slug for the subcategory',
    example: 'physics',
  })
  slug!: string;

  @ApiProperty({
    description: 'Image filename for the subcategory',
    example: 'physics.jpg',
  })
  image!: string;

  @ApiProperty({
    description: 'Thumbnail image filename for the subcategory',
    example: 'physics_thumb.jpg',
  })
  thumb_image!: string;

  @ApiProperty({
    description: 'Order of the subcategory row',
    example: 1,
  })
  row_order!: number;

  @ApiProperty({
    description: 'Status of the subcategory (e.g., active/inactive)',
    example: 1,
  })
  status!: number;

  @ApiProperty({
    description: 'Slug for the parent category',
    example: 'science',
  })
  slug_category?: string;

  @ApiProperty({
    description: 'SEO metadata for the web',
    example: {
      title: 'Best Physics Quizzes',
      description: 'Test your physics knowledge with our quizzes.',
      keywords: 'physics, quizzes, trivia',
    },
  })
  web_seo?: any;

  @ApiProperty({
    description: 'Frequently Asked Questions for the subcategory',
    example: [
      {
        question: 'What is physics?',
        answer:
          'Physics is the study of matter, energy, and the interactions between them.',
      },
    ],
  })
  faq?: any[];

  @ApiProperty({
    description: 'Shareable URL for the subcategory',
    example: 'https://example.com/science/physics',
  })
  share_url?: string;
}
