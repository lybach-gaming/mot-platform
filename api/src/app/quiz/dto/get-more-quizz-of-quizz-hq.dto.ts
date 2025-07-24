import { ApiProperty } from '@nestjs/swagger';

export class GetMoreQuizzOfQuizHqDto {
  @ApiProperty()
  slug_quizzes?: string;
}
