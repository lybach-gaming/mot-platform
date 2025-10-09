import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class DeleteLanguagesDto {
  @ApiProperty({
    description:
      'List of category IDs to delete permanently from Databbase and remove all related data (questions, quizzes, etc.). It is not soft delete.',
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  ids!: number[];
}
