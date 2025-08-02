import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetQuestionsQuizHdDto } from './dto/get-questions-quiz-hd.dto';
import { QuestionService } from './question.service';

@Controller('/v2')
@ApiBearerAuth()
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Get('/get_questions_quiz_hd')
  async getQuestionsQuizHd(
    @Query() dto: GetQuestionsQuizHdDto,
    @CurrentUser('user_id') userId: number,
    @CurrentUser('firebase_id') firebaseId: string
  ) {
    return await this.questionService.getQuestionsQuizHd({
      ...dto,
      userId,
      firebaseId,
    });
  }

  @Post('/get_questions_quiz_hd')
  async getQuestionsQuizHdPost(
    @Body() dto: GetQuestionsQuizHdDto,
    @CurrentUser('user_id') userId: number,
    @CurrentUser('firebase_id') firebaseId: string
  ) {
    return await this.questionService.getQuestionsQuizHd({
      ...dto,
      userId,
      firebaseId,
    });
  }
}
