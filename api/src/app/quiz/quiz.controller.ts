import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { GetDetailQuizzesDto } from './dto/get-detail-quizzes.dto';

@Controller('/v2')
@ApiBearerAuth()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('/get_detail_quizzes')
  async getDetailQuizzes(@Query() dto: GetDetailQuizzesDto) {
    return await this.quizService.getDetailQuizzes(dto);
  }

  @Post('/get_detail_quizzes')
  async getDetailQuizzesPost(@Body() dto: GetDetailQuizzesDto) {
    return await this.quizService.getDetailQuizzes(dto);
  }
}
