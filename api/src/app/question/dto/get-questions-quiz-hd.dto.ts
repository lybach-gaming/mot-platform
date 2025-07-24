import { ApiProperty } from '@nestjs/swagger';

export class GetQuestionsQuizHdDto {
  userId?: number | string | null;
  firebaseId?: string | null;

  @ApiProperty()
  language_id?: string;

  @ApiProperty()
  category?: string;

  @ApiProperty()
  sub_cat?: string;

  @ApiProperty()
  sub_cat_level?: string;

  @ApiProperty()
  quizzes?: string;
}
