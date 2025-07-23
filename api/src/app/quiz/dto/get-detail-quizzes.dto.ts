import { ApiProperty } from '@nestjs/swagger';

export class GetDetailQuizzesDto {
  userId?: number | string | null;

  @ApiProperty()
  id?: string;

  @ApiProperty()
  slug_quizzes?: string;

  @ApiProperty()
  language_id?: string;
}
