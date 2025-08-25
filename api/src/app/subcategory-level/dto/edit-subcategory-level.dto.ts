import { CreateSubcategoryLevelDto } from './create-subcategory-level.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsArray } from 'class-validator';

export class EditSubcategoryLevelDto extends PartialType(
  CreateSubcategoryLevelDto
) {
  @IsOptional()
  @IsArray()
  edit_faq_ids?: number[];
}
