import { CreateCategoryDto } from './create-category.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsArray } from 'class-validator';

export class EditCategoryDto extends PartialType(CreateCategoryDto) {
  @IsOptional()
  @IsArray()
  edit_faq_ids?: number[];
}
