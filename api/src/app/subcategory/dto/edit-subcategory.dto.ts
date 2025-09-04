import { CreateSubcategoryDto } from './create-subcategory.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsArray } from 'class-validator';

export class EditSubcategoryDto extends PartialType(
  CreateSubcategoryDto
) {
  @IsOptional()
  @IsArray()
  edit_faq_ids?: number[];
}
