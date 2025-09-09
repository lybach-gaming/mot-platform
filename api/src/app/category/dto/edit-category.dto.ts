import { CreateCategoryDto } from './create-category.dto';
import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray } from 'class-validator';

export class EditCategoryDto extends PartialType(CreateCategoryDto) {
  @ApiProperty({
    description: 'Array of FAQ IDs to edit',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  edit_faq_ids?: number[];
}
