import { ApiProperty } from '@nestjs/swagger';

export class GetQuizRulesDto {
  @ApiProperty()
  quizz_mode?: string;
}
