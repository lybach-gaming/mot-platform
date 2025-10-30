import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Query,
  Param,
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
} from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { GetDetailQuizzesDto } from './dto/get-detail-quizzes.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { GetListQuizDto } from './dto/get-list-quiz.dto';
import { LegacyGetListQuizDto } from './dto/legacy-get-list-quizzes.dto';
import { GetMoreQuizzOfQuizHqDto } from './dto/get-more-quizz-of-quizz-hq.dto';
import { GetQuizRulesDto } from './dto/get-quiz-rules.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { EditQuizDto } from './dto/edit-quiz.dto';
import { DeleteQuizzesDto } from './dto/delete-quizzes.dto';
import { GetAllQuizzesDto } from './dto/filter-quiz.dto';
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
    type: EditQuizDto,
  })
  @Put('/admin/quizzes/:id')
  @UseInterceptors(FileInterceptor('image_file'))
  async editQuiz(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() editQuizDto: EditQuizDto
  ) {
    if (file) {
      editQuizDto.image_file = file;
    }
    return await this.quizService.editQuiz(+id, editQuizDto);
  }

  // [Admin] Endpoint to get all quizzes
  @ApiOperation({ summary: '[Admin] Get all quizzes' })
  @Get('/admin/quizzes')
  async getAllQuizzes(@Query() query: GetAllQuizzesDto) {
    return await this.quizService.getAllQuizzes(query);
  }

  // [Admin] Endpoint to get quiz details
  @ApiOperation({ summary: '[Admin] Get quiz details' })
  @Get('/admin/quizzes/:id')
  async getQuizDetails(@Param('id', ParseIntPipe) id: number) {
    return await this.quizService.getQuizDetails(+id);
  }

  // [Admin] Endpoint to delete a quiz
  @ApiOperation({ summary: '[Admin] Delete a quiz' })
  @Delete('/admin/quizzes/:id')
  async deleteQuiz(@Param('id', ParseIntPipe) id: number) {
    return await this.quizService.deleteQuizzes([id]);
  }

  // [Admin] Endpoint to delete multiple quizzes
  @ApiOperation({ summary: '[Admin] Delete multiple quizzes' })
  @ApiBody({
    description: 'Array of quiz IDs to delete',
    type: DeleteQuizzesDto,
  })
  @Delete('/admin/quizzes')
  async deleteMultipleQuizzes(@Body() dto: DeleteQuizzesDto) {
    return await this.quizService.deleteQuizzes(dto.ids);
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

  // Search quizzes
  @Get('/quizzes')
  async getListQuiz(@Query() dto: GetListQuizDto) {
    return await this.quizService.getListQuiz({ ...dto });
  }

  // Post method: /get_list_quizzes
  @Post('/get_list_quizzes')
  @ApiOperation({ summary: 'Get list of quizzes' })
  @ApiBody({
    description: 'Parameters for fetching the list of quizzes',
    type: LegacyGetListQuizDto,
  })
  async getListQuizPost(@Body() dto: LegacyGetListQuizDto) {
    return await this.quizService.getListQuizLegacy(dto);
  }
}
