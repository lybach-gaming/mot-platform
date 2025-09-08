import { CreateSubcategoryDto } from './create-subcategory.dto';
import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray } from 'class-validator';

export class EditSubcategoryDto extends PartialType(CreateSubcategoryDto) {
  @ApiProperty({
    description: 'Array of FAQ IDs to edit',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  edit_faq_ids?: number[];
}
