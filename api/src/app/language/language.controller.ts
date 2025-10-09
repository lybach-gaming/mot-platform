import {
  Controller,
  Get,
  Post,
  Query,
  ParseIntPipe,
  Body,
  Put,
  Delete,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { LanguageService } from './language.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { EditLanguageDto } from './dto/edit-language.dto';
import { DeleteLanguagesDto } from './dto/delete-language.dto';
import { LanguageSortBy } from '../../common/constants/language';
import { OrderBy } from '../../common/constants/app';

@Controller('v2')
@ApiTags('Language')
@ApiBearerAuth()
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  // [Admin] Endpoint to create a language
  @ApiOperation({ summary: '[Admin] Create a language (create from scratch)' })
  @ApiBody({
    description: 'Create a new language',
    type: CreateLanguageDto,
  })
  @Post('/admin/languages')
  async createLanguage(@Body() createLanguageDto: CreateLanguageDto) {
    return await this.languageService.createLanguage(createLanguageDto);
  }

  // [Admin] Endpoint to edit a language
  @ApiOperation({
    summary: '[Admin] Edit a language (update status or type of language)',
  })
  @ApiBody({
    description:
      'Edit an existing language. If you want to add new language to the list, update type to 1, if you want to remove language from the list, update type to 0. To change status, update status field.',
    type: EditLanguageDto,
  })
  @Put('/admin/languages/:id')
  async editLanguage(
    @Param('id', ParseIntPipe) id: number,
    @Body() editLanguageDto: EditLanguageDto
  ) {
    return await this.languageService.editLanguage(+id, editLanguageDto);
  }
  // [Admin] Endpoint to get all languages
  @ApiOperation({ summary: '[Admin] Get all languages' })
  @Get('/admin/languages')
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of languages per page (default: 20)',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of items to skip (default: 0)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by language name or code',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    enum: LanguageSortBy,
    default: LanguageSortBy.ID,
    description: 'Field to sort by',
  })
  @ApiQuery({
    name: 'order',
    required: false,
    type: String,
    enum: OrderBy,
    default: OrderBy.DESC,
    description: 'Sorting direction',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: Number,
    description: 'Filter by status (0 = Disabled, 1 = Enabled)',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: Number,
    description: 'Filter by type (0 = Inactive, 1 = Active)',
  })
  async getAllLanguages(
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: LanguageSortBy = LanguageSortBy.ID,
    @Query('order') order: OrderBy = OrderBy.DESC,
    @Query('status') status?: number,
    @Query('type') type?: number
  ) {
    return await this.languageService.getAllLanguages({
      limit,
      offset,
      search,
      sortBy,
      order,
      status,
      type,
    });
  }

  // [Admin] Endpoint to get language details
  @ApiOperation({ summary: '[Admin] Get language details' })
  @Get('/admin/languages/:id')
  async getLanguageAdminDetails(@Param('id', ParseIntPipe) id: number) {
    return await this.languageService.getLanguageAdminDetails(+id);
  }

  // [Admin] Endpoint to delete a language
  @ApiOperation({ summary: '[Admin] Delete a language' })
  @Delete('/admin/languages/:id')
  async deleteLanguage(@Param('id', ParseIntPipe) id: number) {
    return await this.languageService.deleteLanguages([id]);
  }

  // [Admin] Endpoint to delete multiple languages
  @ApiOperation({ summary: '[Admin] Delete multiple languages' })
  @ApiBody({
    description: 'Array of language IDs to delete',
    type: DeleteLanguagesDto,
  })
  @Delete('/admin/languages')
  async deleteMultipleLanguages(@Body() dto: DeleteLanguagesDto) {
    return await this.languageService.deleteLanguages(dto.ids);
  }
}
