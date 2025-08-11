import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateQuestionDto } from './create-question.dto';

export class EditQuestionDto extends PartialType(CreateQuestionDto) {
  @ApiPropertyOptional({
    description: '0=keep image, 1=remove image',
    enum: [0, 1],
    default: 0,
  })
  @IsOptional()
  @Type(() => Number) // form-data string -> number
  @IsIn([0, 1])
  remove_image?: number; // 1 = remove image, 0 = keep image
}
