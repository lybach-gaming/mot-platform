import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetDetailQuizzesDto } from './dto/get-detail-quizzes.dto';
import { GetListQuizDto } from './dto/get-list-quiz.dto';
import { GetMoreQuizzOfQuizHqDto } from './dto/get-more-quizz-of-quizz-hq.dto';
import { GetQuizRulesDto } from './dto/get-quiz-rules.dto';
import { QuizService } from './quiz.service';

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

  @Get('/get_more_quizz_of_quizz_hq')
  async getMoreQuizzOfQuizHq(@Query() dto: GetMoreQuizzOfQuizHqDto) {
    return await this.quizService.getMoreQuizzOfQuizHq({ ...dto });
  }

  @Post('/get_more_quizz_of_quizz_hq')
  async getMoreQuizzOfQuizHqPost(@Body() dto: GetMoreQuizzOfQuizHqDto) {
    return await this.quizService.getMoreQuizzOfQuizHq({ ...dto });
  }

  @Get('/get_quiz_rule')
  async getQuizRules(@Query() dto: GetQuizRulesDto) {
    return await this.quizService.getQuizRules({ ...dto });
  }

  @Post('/get_quiz_rule')
  async getQuizRulesPost(@Body() dto: GetQuizRulesDto) {
    return await this.quizService.getQuizRules({ ...dto });
  }

  @Get('/quizzes')
  async getListQuiz(@Query() dto: GetListQuizDto) {
    return await this.quizService.getListQuiz({ ...dto });
  }
}
