import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { GetDetailQuizzesDto } from './dto/get-detail-quizzes.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetQuizRulesDto } from './dto/get-quiz-rules.dto';

@Controller('/v2')
@ApiBearerAuth()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('/get_detail_quizzes')
  async getDetailQuizzes(
    @Query() dto: GetDetailQuizzesDto,
    @CurrentUser('user_id') userId: number
  ) {
    return await this.quizService.getDetailQuizzes({ ...dto, userId });
  }

  @Post('/get_detail_quizzes')
  async getDetailQuizzesPost(
    @Body() dto: GetDetailQuizzesDto,
    @CurrentUser('user_id') userId: number
  ) {
    return await this.quizService.getDetailQuizzes({ ...dto, userId });
  }

  @Get('/get_quiz_rule')
  async getQuizRules(@Query() dto: GetQuizRulesDto) {
    return await this.quizService.getQuizRules({ ...dto });
  }

  @Post('/get_quiz_rule')
  async getQuizRulesPost(@Body() dto: GetQuizRulesDto) {
    return await this.quizService.getQuizRules({ ...dto });
  }
}
