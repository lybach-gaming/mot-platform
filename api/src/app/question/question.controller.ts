import { Body, Controller, Get, Post, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateQuestionDto } from './dto/create-question.dto';
import { BatchCreateQuestionDto } from './dto/batch-create-question.dto';
import { GetQuestionsQuizHdDto } from './dto/get-questions-quiz-hd.dto';
import { QuestionService } from './question.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { normalizeIndexedFormData } from '../../common/utils/normalizeFormDataBody.util';

@Controller('/v2')
@ApiBearerAuth()
@ApiTags('Question')
export class QuestionController {
  constructor(private readonly questionService: QuestionService) {}

  @Post('/admin/questions')
  @UseInterceptors(FileInterceptor('image_file'))
  async createQuestion(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any
  ) {
    if (
      !body.questions &&
      Object.keys(body).some((k) => k.startsWith('questions['))
    ) {
      body = normalizeIndexedFormData(body);
    }

    if (body.questions) {
      // Batch
      const dto = plainToInstance(BatchCreateQuestionDto, body);
      await validateOrReject(dto);
      return this.questionService.createQuestionBatch(dto, file);
    } else {
      // Single
      const dto = plainToInstance(CreateQuestionDto, body);
      await validateOrReject(dto);
      return this.questionService.createQuestion(dto, file);
    }
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
