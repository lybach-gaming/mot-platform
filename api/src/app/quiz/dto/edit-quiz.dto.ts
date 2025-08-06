import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizDto } from './create-quiz.dto';
import { IsOptional, IsArray } from 'class-validator';

export class EditQuizDto extends PartialType(CreateQuizDto) {
  @IsOptional()
  @IsArray()
  edit_faq_ids?: number[];
}
