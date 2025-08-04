import { Body, Controller, Get, Post, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateQuestionDto } from './dto/create-question.dto';
import { GetQuestionsQuizHdDto } from './dto/get-questions-quiz-hd.dto';
import { QuestionService } from './question.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/v2')
@ApiBearerAuth()
@ApiTags('Question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('/admin/questions')
  @UseInterceptors(FileInterceptor('image_file'))
  async createQuestion(
    @UploadedFile() file: Express.Multer.File,
    @Body() createQuestionDto: CreateQuestionDto
  ) {
    return await this.questionService.createQuestion(createQuestionDto);
  }

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
