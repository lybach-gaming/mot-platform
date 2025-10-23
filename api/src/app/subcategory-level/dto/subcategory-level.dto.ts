import { ApiProperty } from '@nestjs/swagger';

export class SubcategoryLevelDetailDto {
  @ApiProperty({
    description: 'Unique identifier for the subcategory level',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: 'Name of the subcategory level',
    example: 'Quantum Mechanics',
  })
  name!: string;

  @ApiProperty({
    description: 'Language ID associated with the subcategory level',
    example: 1,
  })
  language_id!: number;

  @ApiProperty({
    description: 'Main category ID associated with the subcategory level',
    example: 1,
  })
  maincat_id!: number;

  @ApiProperty({
    description: 'Subcategory ID associated with the subcategory level',
    example: 1,
  })
  main_subcat_id!: number;

  @ApiProperty({
    description: 'Slug for the subcategory level',
    example: 'quantum-mechanics',
  })
  slug!: string;

  @ApiProperty({
    description: 'Image filename for the subcategory level',
    example: 'quantum_mechanics.jpg',
  })
  image!: string;

  @ApiProperty({
    description: 'Thumbnail image filename for the subcategory level',
    example: 'quantum_mechanics_thumb.jpg',
  })
  thumb_image!: string;

  @ApiProperty({
    description: 'Order of the subcategory level row',
    example: 1,
  })
  row_order!: number;

  @ApiProperty({
    description: 'Status of the subcategory level (e.g., active/inactive)',
    example: 1,
  })
  status!: number;

  @ApiProperty({
    description: 'Slug for the parent category',
    example: 'science',
  })
  slug_category?: string;

  @ApiProperty({
    description: 'Slug for the parent subcategory',
    example: 'physics',
  })
  slug_subcategory?: string;

  @ApiProperty({
    description: 'SEO metadata for the web',
    example: {
      title: 'Best Quantum Mechanics Quizzes',
      description: 'Test your quantum mechanics knowledge with our quizzes.',
      keywords: 'quantum mechanics, quizzes, trivia',
    },
  })
  web_seo?: any;

  @ApiProperty({
    description: 'Frequently Asked Questions for the subcategory level',
    example: [
      {
        question: 'What is quantum mechanics?',
        answer:
          'Quantum mechanics is a fundamental theory in physics that describes nature at the smallest scales of energy levels of atoms and subatomic particles.',
      },
    ],
  })
  faq?: any[];

  @ApiProperty({
    description: 'Shareable URL for the subcategory level',
    example: 'https://example.com/science/physics/quantum-mechanics',
  })
  share_url?: string;
}
