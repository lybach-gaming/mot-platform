import { Body, Controller, Get, Post, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { GetDetailQuizzesDto } from './dto/get-detail-quizzes.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetMoreQuizzOfQuizHqDto } from './dto/get-more-quizz-of-quizz-hq.dto';
import { GetQuizRulesDto } from './dto/get-quiz-rules.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/v2')
@ApiBearerAuth()
@ApiTags('Quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post('/admin/quizzes')
  @UseInterceptors(FileInterceptor('image_file'))
  async createQuiz(
    @UploadedFile() file: Express.Multer.File,
    @Body() createQuizDto: CreateQuizDto
  ) {
    if (file) {
      createQuizDto.image_file = file;
    }
    return await this.quizService.createQuiz(createQuizDto);
  }

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
}
