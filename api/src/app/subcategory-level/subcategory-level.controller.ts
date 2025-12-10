import {
  Controller,
  Get,
  Post,
  Query,
  ParseIntPipe,
  Body,
  Put,
  Delete,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiTags,
  ApiConsumes,
} from '@nestjs/swagger';
import { SubcategoryLevelService } from './subcategory-level.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSubcategoryLevelDto } from './dto/create-subcategory-level.dto';
import { EditSubcategoryLevelDto } from './dto/edit-subcategory-level.dto';
import { DeleteSubcategoryLevelsDto } from './dto/delete-subcategory-levels.dto';
import { GetAllSubcategoryLevelsDto } from './dto/filter-subcategory-level.dto';

interface SubcategoryLevelParams {
  id?: number;
  language_id?: number;
  slug_subcategory_level?: string;
}

@Controller('v2')
@ApiTags('Subcategory Level')
@ApiBearerAuth()
export class SubcategoryLevelController {
  constructor(
    private readonly subcategoryLevelService: SubcategoryLevelService
  ) {}

  // [Admin] Endpoint to create a subcategory level
  @ApiOperation({ summary: '[Admin] Create a subcategory level' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new subcategory level',
    type: CreateSubcategoryLevelDto,
  })
  @Post('/admin/subcategory-levels')
  @UseInterceptors(FileInterceptor('image_file'))
  async createSubcategoryLevel(
    @UploadedFile() file: Express.Multer.File,
    @Body() createSubcategoryLevelDto: CreateSubcategoryLevelDto
  ) {
    if (file) {
      createSubcategoryLevelDto.image_file = file;
    }
    return await this.subcategoryLevelService.createSubcategoryLevel(
      createSubcategoryLevelDto
    );
  }

  // [Admin] Endpoint to edit a subcategory level
  @ApiOperation({ summary: '[Admin] Edit a subcategory level' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Edit an existing subcategory level',
    type: EditSubcategoryLevelDto,
  })
  @Put('/admin/subcategory-levels/:id')
  @UseInterceptors(FileInterceptor('image_file'))
  async editSubcategoryLevel(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() editSubcategoryLevelDto: EditSubcategoryLevelDto
  ) {
    if (file) {
      editSubcategoryLevelDto.image_file = file;
    }
    return await this.subcategoryLevelService.editSubcategoryLevel(
      +id,
      editSubcategoryLevelDto
    );
  }
  // [Admin] Endpoint to get all subcategory levels
  @ApiOperation({ summary: '[Admin] Get all subcategory levels' })
  @Get('/admin/subcategory-levels')
  async getAllSubcategoryLevels(@Query() query: GetAllSubcategoryLevelsDto) {
    return await this.subcategoryLevelService.getAllSubcategoryLevels(query);
  }

  // [Admin] Endpoint to get subcategory level details
  @ApiOperation({ summary: '[Admin] Get subcategory level details' })
  @Get('/admin/subcategory-levels/:id')
  async getSubcategoryLevelAdminDetails(@Param('id', ParseIntPipe) id: number) {
    return await this.subcategoryLevelService.getSubcategoryLevelAdminDetails(
      +id
    );
  }

  // [Admin] Endpoint to delete a subcategory level
  @ApiOperation({ summary: '[Admin] Delete a subcategory level' })
  @Delete('/admin/subcategory-levels/:id')
  async deleteSubcategoryLevel(@Param('id', ParseIntPipe) id: number) {
    return await this.subcategoryLevelService.deleteSubcategoryLevels([id]);
  }

  // [Admin] Endpoint to delete multiple subcategory levels
  @ApiOperation({ summary: '[Admin] Delete multiple subcategory levels' })
  @ApiBody({
    description: 'Array of subcategory level IDs to delete',
    type: DeleteSubcategoryLevelsDto,
  })
  @Delete('/admin/subcategory-levels')
  async deleteMultipleSubcategoryLevels(
    @Body() dto: DeleteSubcategoryLevelsDto
  ) {
    return await this.subcategoryLevelService.deleteSubcategoryLevels(dto.ids);
  }

  // Route to get subcategory level detail using GET method
  @Get('get_detail_subcategory_level')
  @ApiOperation({ summary: 'Get subcategory level detail (GET)' })
  @ApiQuery({ name: 'id', required: false })
  @ApiQuery({ name: 'language_id', required: false })
  @ApiQuery({ name: 'slug_subcategory_level', required: false })
  async getSubcategoryLevelDetailGet(
    @Query('id', new ParseIntPipe({ optional: true })) id?: number,
    @Query('language_id', new ParseIntPipe({ optional: true }))
    languageId?: number,
    @Query('slug_subcategory_level') slugSubcategoryLevel?: string
  ) {
    return this.handleSubcategoryLevelRequest({
      id,
      language_id: languageId,
      slug_subcategory_level: slugSubcategoryLevel,
    });
  }

  // Route to get subcategory level detail using POST method
  @Post('get_detail_subcategory_level')
  @ApiOperation({ summary: 'Get subcategory level detail (POST)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        language_id: { type: 'number' },
        slug_subcategory_level: { type: 'string' },
      },
    },
  })
  async getSubcategoryLevelDetailPost(@Body() params: SubcategoryLevelParams) {
    return this.handleSubcategoryLevelRequest(params);
  }

  private async handleSubcategoryLevelRequest(params: SubcategoryLevelParams) {
    const subcategoryLevelDetail =
      await this.subcategoryLevelService.getSubcategoryLevelDetail({
        id: params.id ? Number(params.id) : undefined,
        languageId: params.language_id ? Number(params.language_id) : undefined,
        slug: params.slug_subcategory_level,
      });

    return subcategoryLevelDetail;
  }
}
