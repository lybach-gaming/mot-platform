import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class GetQuizRulesDto {
  @ApiProperty({
    description: 'Quiz mode',
    example: 'standard',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  quizz_mode?: number;
}
