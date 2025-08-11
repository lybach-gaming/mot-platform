import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiParam,
  getSchemaPath,
} from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateQuestionDto } from './dto/create-question.dto';
import { BatchCreateQuestionDto } from './dto/batch-create-question.dto';
import { EditQuestionDto } from './dto/edit-question.dto';
import { DeleteQuestionsDto } from './dto/delete-question.dto';
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

  // [Admin] Create Question
  @ApiOperation({
    summary: '[Admin] Create Question',
    description: 'Create a new question or batch of questions.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiBody({
    description: 'Create single or batch questions',
    schema: {
      oneOf: [
        { $ref: getSchemaPath(CreateQuestionDto) },
        { $ref: getSchemaPath(BatchCreateQuestionDto) },
      ],
    },
  })
  @Post('/admin/questions')
  @UseInterceptors(FileInterceptor('image_file'))
  async createQuestion(
    @UploadedFile() files: Express.Multer.File[],
    @Body() body: any
  ) {
    if (
      !body.questions &&
      Object.keys(body).some((k) => k.startsWith('questions['))
    ) {
      body = normalizeIndexedFormData(body);
    }

    if (body.questions) {
      // Batch: questions[i][image_file]
      const byIndex = new Map<number, Express.Multer.File>();
      for (const f of files || []) {
        const m = f.fieldname.match(/^questions\[(\d+)\]\[image_file\]$/);
        if (m) byIndex.set(Number(m[1]), f);
      }
      body.questions.forEach((q, i) => {
        const f = byIndex.get(i);
        if (f) (q as any).image_file = f;
      });
      const dto = plainToInstance(BatchCreateQuestionDto, body);
      await validateOrReject(dto);
      return this.questionService.createQuestionBatch(dto);
    } else {
      // Single
      const single = (files || []).find((f) => f.fieldname === 'image_file');
      if (single) (body as any).image_file = single;
      const dto = plainToInstance(CreateQuestionDto, body);
      await validateOrReject(dto);
      return this.questionService.createQuestion(dto);
    }
  }

  // [Admin] Edit Question
  @ApiOperation({
    summary: '[Admin] Edit Question',
    description: 'Edit an existing question by ID.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiParam({ name: 'id', type: Number })
  @ApiBody({ type: EditQuestionDto })
  @Put('/admin/questions/:id')
  @UseInterceptors(FileInterceptor('image_file'))
  async editQuestion(
    @UploadedFile() file: Express.Multer.File,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: EditQuestionDto
  ) {
    if (file) {
      body.image_file = file;
    }
    const dto = plainToInstance(CreateQuestionDto, body);
    await validateOrReject(dto);
    return this.questionService.editQuestion(id, dto);
  }

  // [Admin] Endpoint to delete a question
  @ApiOperation({ summary: '[Admin] Delete a question' })
  @Delete('/admin/questions/:id')
  async deleteQuestion(@Param('id', ParseIntPipe) id: number) {
    return await this.questionService.deleteQuestions([id]);
  }

  // [Admin] Endpoint to delete multiple questions
  @ApiOperation({ summary: '[Admin] Delete multiple questions' })
  @ApiBody({
    description: 'Array of question IDs to delete',
    type: DeleteQuestionsDto,
  })
  @Delete('/admin/questions')
  async deleteMultipleQuestions(@Body() dto: DeleteQuestionsDto) {
    return await this.questionService.deleteQuestions(dto.ids);
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
