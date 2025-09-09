import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetMoreQuizzOfQuizHqDto {
  @ApiProperty({
    description: 'Quiz HQ Slug',
    example: 'sample-quiz',
    required: false,
  })
  @IsOptional()
  @IsString()
  slug_quizzes?: string;
}
