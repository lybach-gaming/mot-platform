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
import { SubcategoryService } from './subcategory.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { EditSubcategoryDto } from './dto/edit-subcategory.dto';
import { DeleteSubcategoriesDto } from './dto/delete-subcategory.dto';
import { GetAllSubcategoriesDto } from './dto/filter-subcategory.dto';

interface SubcategoryParams {
  id?: number;
  language_id?: number;
  slug_subcategory?: string;
}

@Controller('v2')
@ApiTags('Subcategory')
@ApiBearerAuth()
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  // [Admin] Endpoint to create a subcategory
  @ApiOperation({ summary: '[Admin] Create a subcategory' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new subcategory',
    type: CreateSubcategoryDto,
  })
  @Post('/admin/subcategories')
  @UseInterceptors(FileInterceptor('image_file'))
  async createSubcategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() createSubcategoryDto: CreateSubcategoryDto
  ) {
    if (file) {
      createSubcategoryDto.image_file = file;
    }
    return await this.subcategoryService.createSubcategory(
      createSubcategoryDto
    );
  }

  // [Admin] Endpoint to edit a subcategory
  @ApiOperation({ summary: '[Admin] Edit a subcategory' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Edit an existing subcategory',
    type: EditSubcategoryDto,
  })
  @Put('/admin/subcategories/:id')
  @UseInterceptors(FileInterceptor('image_file'))
  async editSubcategory(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() editSubcategoryDto: EditSubcategoryDto
  ) {
    if (file) {
      editSubcategoryDto.image_file = file;
    }
    return await this.subcategoryService.editSubcategory(
      +id,
      editSubcategoryDto
    );
  }
  // [Admin] Endpoint to get all subcategories
  @ApiOperation({ summary: '[Admin] Get all subcategories' })
  @Get('/admin/subcategories')
  async getAllSubcategories(@Query() query: GetAllSubcategoriesDto) {
    return await this.subcategoryService.getAllSubcategories(query);
  }

  // [Admin] Endpoint to get subcategory details
  @ApiOperation({ summary: '[Admin] Get subcategory details' })
  @Get('/admin/subcategories/:id')
  async getSubcategoryAdminDetails(@Param('id', ParseIntPipe) id: number) {
    return await this.subcategoryService.getSubcategoryAdminDetails(+id);
  }

  // [Admin] Endpoint to delete a subcategory
  @ApiOperation({ summary: '[Admin] Delete a subcategory' })
  @Delete('/admin/subcategories/:id')
  async deleteSubcategory(@Param('id', ParseIntPipe) id: number) {
    return await this.subcategoryService.deleteSubcategories([id]);
  }

  // [Admin] Endpoint to delete multiple subcategories
  @ApiOperation({ summary: '[Admin] Delete multiple subcategories' })
  @ApiBody({
    description: 'Array of subcategory IDs to delete',
    type: DeleteSubcategoriesDto,
  })
  @Delete('/admin/subcategories')
  async deleteMultipleSubcategories(@Body() dto: DeleteSubcategoriesDto) {
    return await this.subcategoryService.deleteSubcategories(dto.ids);
  }

  // Route to get subcategory detail using GET method
  @Get('get_detail_subcategory')
  @ApiOperation({ summary: 'Get subcategory detail (GET)' })
  @ApiQuery({ name: 'id', required: false })
  @ApiQuery({ name: 'language_id', required: false })
  @ApiQuery({ name: 'slug_subcategory', required: false })
  async getSubcategoryDetailGet(
    @Query('id', new ParseIntPipe({ optional: true })) id?: number,
    @Query('language_id', new ParseIntPipe({ optional: true }))
    languageId?: number,
    @Query('slug_subcategory') slugSubcategory?: string
  ) {
    return this.handleSubcategoryRequest({
      id,
      language_id: languageId,
      slug_subcategory: slugSubcategory,
    });
  }

  // Route to get subcategory detail using POST method
  @Post('get_detail_subcategory')
  @ApiOperation({ summary: 'Get subcategory detail (POST)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        language_id: { type: 'number' },
        slug_subcategory: { type: 'string' },
      },
    },
  })
  async getSubcategoryDetailPost(@Body() params: SubcategoryParams) {
    return this.handleSubcategoryRequest(params);
  }

  private async handleSubcategoryRequest(params: SubcategoryParams) {
    const subcategoryDetail =
      await this.subcategoryService.getSubcategoryDetail({
        id: params.id ? Number(params.id) : undefined,
        languageId: params.language_id ? Number(params.language_id) : undefined,
        slug: params.slug_subcategory,
      });

    return subcategoryDetail;
  }
}
