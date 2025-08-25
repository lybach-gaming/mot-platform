import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateQuizDto } from './create-quiz.dto';
import { IsOptional, IsArray } from 'class-validator';

export class EditQuizDto extends PartialType(CreateQuizDto) {
  @ApiPropertyOptional({ type: [Number] })
  @IsOptional()
  @IsArray()
  edit_faq_ids?: number[];
}
