import { ApiProperty } from '@nestjs/swagger';

export class CategoryDetailDto {
  @ApiProperty({
    description: 'Unique identifier for the category',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Name of the category',
    example: 'Science',
  })
  name!: string;

  @ApiProperty({
    description: 'Language ID associated with the category',
    example: 1,
  })
  language_id!: number;

  @ApiProperty({
    description: 'Slug for the category',
    example: 'science',
  })
  slug!: string;

  @ApiProperty({
    description: 'Image filename for the category',
    example: 'science.jpg',
  })
  image!: string;

  @ApiProperty({
    description: 'Thumbnail image filename for the category',
    example: 'science_thumb.jpg',
  })
  thumb_image!: string;

  @ApiProperty({
    description: 'Order of the category row',
    example: 1,
  })
  row_order!: number;

  @ApiProperty({
    description: 'Status of the category (e.g., active/inactive)',
    example: 1,
  })
  status!: number;

  @ApiProperty({
    description: 'SEO metadata for the web',
    example: {
      title: 'Best Science Quizzes',
      description: 'Test your science knowledge with our quizzes.',
      keywords: 'science, quizzes, trivia',
    },
  })
  web_seo?: any;

  @ApiProperty({
    description: 'Frequently Asked Questions related to the category',
    example: [
      {
        question: 'What is the best way to study science?',
        answer: 'Practice regularly and stay curious.',
      },
      {
        question: 'Are these quizzes suitable for beginners?',
        answer: 'Yes, we have quizzes for all levels.',
      },
    ],
  })
  faq?: any[];

  @ApiProperty({
    description: 'Shareable URL for the category',
    example: 'https://example.com/science',
  })
  share_url?: string;
}
