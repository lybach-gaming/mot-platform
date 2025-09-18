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
import { CategoryService } from './category.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateCategoryDto } from './dto/create-category.dto';
import { EditCategoryDto } from './dto/edit-category.dto';
import { DeleteCategoriesDto } from './dto/delete-category.dto';
import { CategorySortBy } from '../../common/constants/category';
import { OrderBy } from '../../common/constants/app';

interface CategoryParams {
  id?: number;
  language_id?: number;
  slug_category?: string;
}

@Controller('v2')
@ApiTags('Category')
@ApiBearerAuth()
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // [Admin] Endpoint to create a category
  @ApiOperation({ summary: '[Admin] Create a category' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Create a new category',
    type: CreateCategoryDto,
  })
  @Post('/admin/categories')
  @UseInterceptors(FileInterceptor('image_file'))
  async createCategory(
    @UploadedFile() file: Express.Multer.File,
    @Body() createCategoryDto: CreateCategoryDto
  ) {
    if (file) {
      createCategoryDto.image_file = file;
    }
    return await this.categoryService.createCategory(createCategoryDto);
  }

  // [Admin] Endpoint to edit a category
  @ApiOperation({ summary: '[Admin] Edit a category' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Edit an existing category',
    type: EditCategoryDto,
  })
  @Put('/admin/categories/:id')
  @UseInterceptors(FileInterceptor('image_file'))
  async editCategory(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body() editCategoryDto: EditCategoryDto
  ) {
    if (file) {
      editCategoryDto.image_file = file;
    }
    return await this.categoryService.editCategory(+id, editCategoryDto);
  }
  // [Admin] Endpoint to get all categories
  @ApiOperation({ summary: '[Admin] Get all categories' })
  @Get('/admin/categories')
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of categories per page (default: 20)',
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
    description: 'Search by title or description',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    type: String,
    enum: CategorySortBy,
    default: CategorySortBy.ID,
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
    name: 'languageId',
    required: false,
    type: Number,
    description: 'Filter by language',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    type: Number,
    description: 'Filter by type (game modes)',
    example:
      '1 - quizz hd, 2 - fund n learn, 3 - guess the word, 4 - audio question, 5 - math mania, 6 - true false',
  })
  async getAllCategories(
    @Query('limit') limit = 20,
    @Query('offset') offset = 0,
    @Query('search') search?: string,
    @Query('sortBy') sortBy: CategorySortBy = CategorySortBy.ID,
    @Query('order') order: OrderBy = OrderBy.DESC,
    @Query('languageId') languageId?: number,
    @Query('type') type?: number
  ) {
    return await this.categoryService.getAllCategories({
      limit,
      offset,
      search,
      sortBy,
      order,
      languageId,
      type,
    });
  }

  // [Admin] Endpoint to get category details
  @ApiOperation({ summary: '[Admin] Get category details' })
  @Get('/admin/categories/:id')
  async getCategoryAdminDetails(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.getCategoryAdminDetails(+id);
  }

  // [Admin] Endpoint to delete a category
  @ApiOperation({ summary: '[Admin] Delete a category' })
  @Delete('/admin/categories/:id')
  async deleteCategory(@Param('id', ParseIntPipe) id: number) {
    return await this.categoryService.deleteCategories([id]);
  }

  // [Admin] Endpoint to delete multiple categories
  @ApiOperation({ summary: '[Admin] Delete multiple categories' })
  @ApiBody({
    description: 'Array of category IDs to delete',
    type: DeleteCategoriesDto,
  })
  @Delete('/admin/categories')
  async deleteMultipleCategories(@Body() dto: DeleteCategoriesDto) {
    return await this.categoryService.deleteCategories(dto.ids);
  }

  // Route to get category detail using GET method
  @Get('get_detail_category_quiz_hd')
  @ApiOperation({ summary: 'Get category detail (GET)' })
  @ApiQuery({ name: 'id', required: false })
  @ApiQuery({ name: 'language_id', required: false })
  @ApiQuery({ name: 'slug_category', required: false })
  async getCategoryDetailGet(
    @Query('id', new ParseIntPipe({ optional: true })) id?: number,
    @Query('language_id', new ParseIntPipe({ optional: true }))
    languageId?: number,
    @Query('slug_category') slugCategory?: string
  ) {
    return this.handleCategoryRequest({
      id,
      language_id: languageId,
      slug_category: slugCategory,
    });
  }

  // Route to get category detail using POST method
  @Post('get_detail_category_quiz_hd')
  @ApiOperation({ summary: 'Get category detail (POST)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        language_id: { type: 'number' },
        slug_category: { type: 'string' },
      },
    },
  })
  async getCategoryDetailPost(@Body() params: CategoryParams) {
    return this.handleCategoryRequest(params);
  }

  private async handleCategoryRequest(params: CategoryParams) {
    const categoryDetail = await this.categoryService.getCategoryDetail({
      id: params.id ? Number(params.id) : undefined,
      languageId: params.language_id ? Number(params.language_id) : undefined,
      slug: params.slug_category,
    });

    return categoryDetail;
  }
}
