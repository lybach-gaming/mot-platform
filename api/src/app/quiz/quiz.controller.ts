import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { GetDetailQuizzesDto } from './dto/get-detail-quizzes.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetMoreQuizzOfQuizHqDto } from './dto/get-more-quizz-of-quizz-hq.dto';
import { GetQuizRulesDto } from './dto/get-quiz-rules.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { EditQuizDto } from './dto/edit-quiz.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('/v2')
@ApiBearerAuth()
@ApiTags('Quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  // [Admin] Endpoint to create a quiz
  @ApiOperation({ summary: '[Admin] Create a quiz' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new quiz',
    type: CreateQuizDto,
  })
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

  // [Admin] Endpoint to edit a quiz
  @ApiOperation({ summary: '[Admin] Edit a quiz' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Edit an existing quiz',
    schema: {
      type: 'object',
      properties: {
        image_file: { type: 'string', format: 'binary' },
        language_id: { type: 'number' },
        quiz_mode: { type: 'number' },
        maincat_id: { type: 'number' },
        main_subcat_id: { type: 'number' },
        main_subcat_level_id: { type: 'number', nullable: true },
        quizz_name: { type: 'string' },
        slug: { type: 'string' },
        status: { type: 'string', enum: ['Active', 'Deactive'] },
        image: { type: 'string', format: 'binary', nullable: true },
        web_seo: {
          type: 'object',
          properties: {
            sub_heading: { type: 'string' },
            seo_block: { type: 'string' },
            meta_title: { type: 'string' },
            meta_description: { type: 'string' },
            meta_keywords: { type: 'string' },
            schema_markup: { type: 'string' },
            sponsor_link: { type: 'string' },
            sponsor_name: { type: 'string' },
          },
        },
        enable_faq: { type: 'boolean' },
        questions: {
          type: 'array',
          items: { type: 'string' },
        },
        answers: {
          type: 'array',
          items: { type: 'string' },
        },
        edit_faq_ids: {
          type: 'array',
          items: { type: 'number' },
          description:
            'IDs of FAQs to edit or keep, which not included will be deleted',
        },
        is_featured: { type: 'boolean', nullable: true },
        is_coming_soon: { type: 'boolean', nullable: true },
        is_pinned: { type: 'boolean', nullable: true },
        is_send_notice: { type: 'boolean', nullable: true },
      },
    },
  })
  @Put('/admin/quizzes/:id')
  @UseInterceptors(FileInterceptor('image_file'))
  async editQuiz(
    @Param('id') id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() editQuizDto: EditQuizDto
  ) {
    if (file) {
      editQuizDto.image_file = file;
    }
    return await this.quizService.editQuiz(+id, editQuizDto);
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
