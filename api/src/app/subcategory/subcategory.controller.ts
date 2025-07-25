import { Controller, Get, Post, Query, ParseIntPipe, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { SubcategoryService } from './subcategory.service';

interface SubcategoryParams {
  id?: number;
  language_id?: number;
  slug_subcategory?: string;
}

/**
 * Get subcategory detail by ID, language ID, or slug.
 * Supports both GET and POST methods.
 * @param id - Optional subcategory ID.
 * @param languageId - Optional language ID.
 * @param slugSubcategory - Optional slug for the subcategory.
 * @returns subcategory detail.
 */
@Controller('v2')
@ApiTags('Subcategory')
@ApiBearerAuth()
export class SubcategoryController {
  constructor(
    private readonly subcategoryService: SubcategoryService
  ) {}

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
        id: { type: 'number', required: false },
        language_id: { type: 'number', required: false },
        slug_subcategory: { type: 'string', required: false },
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

    return {
      error: false,
      data: subcategoryDetail,
    };
  }
}
