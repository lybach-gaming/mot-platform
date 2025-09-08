import { PartialType, ApiProperty } from '@nestjs/swagger';
import { CreateQuizDto } from './create-quiz.dto';
import { IsOptional, IsArray } from 'class-validator';

export class EditQuizDto extends PartialType(CreateQuizDto) {
  @ApiProperty({
    description: 'Array of FAQ IDs to edit',
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  edit_faq_ids?: number[];
}
