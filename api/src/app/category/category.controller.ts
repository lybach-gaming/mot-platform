import { Controller, Get, Post, Query, ParseIntPipe, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { CategoryService } from './category.service';

interface CategoryParams {
  id?: number;
  language_id?: number;
  slug_category?: string;
}

/**
 * Get category detail by ID, language ID, or slug.
 * Supports both GET and POST methods.
 * @param id - Optional category ID.
 * @param languageId - Optional language ID.
 * @param slugCategory - Optional slug for the category.
 * @returns category detail.
 */
@Controller('v2')
@ApiTags('Category')
@ApiBearerAuth()
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService
  ) {}

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
        id: { type: 'number', required: false },
        language_id: { type: 'number', required: false },
        slug_category: { type: 'string', required: false },
      },
    },
  })
  async getCategoryDetailPost(@Body() params: CategoryParams) {
    return this.handleCategoryRequest(params);
  }

  private async handleCategoryRequest(params: CategoryParams) {
    const categoryDetail =
      await this.categoryService.getCategoryDetail({
        id: params.id ? Number(params.id) : undefined,
        languageId: params.language_id ? Number(params.language_id) : undefined,
        slug: params.slug_category,
      });

    return {
      error: false,
      data: categoryDetail,
    };
  }
}
