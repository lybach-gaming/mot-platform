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
import { ApiBearerAuth, ApiOperation, ApiBody, ApiTags } from '@nestjs/swagger';
import { LanguageService } from './language.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { EditLanguageDto } from './dto/edit-language.dto';
import { DeleteLanguagesDto } from './dto/delete-language.dto';
import { GetAllLanguagesDto } from './dto/filter-language.dto';

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
    summary:
      '[Admin] Edit a language info / Add a language to the list / Remove a language from the list',
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
  async getAllLanguages(@Query() query: GetAllLanguagesDto) {
    return await this.languageService.getAllLanguages(query);
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
