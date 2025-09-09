import { CreateSubcategoryLevelDto } from './create-subcategory-level.dto';
import { PartialType, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray } from 'class-validator';

export class EditSubcategoryLevelDto extends PartialType(
  CreateSubcategoryLevelDto
) {
  @ApiProperty({
    description: 'Array of FAQ IDs to edit',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  edit_faq_ids?: number[];
}
