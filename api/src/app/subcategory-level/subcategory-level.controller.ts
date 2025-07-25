import { Controller, Get, Post, Query, ParseIntPipe, Body } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiBody,
  ApiTags,
} from '@nestjs/swagger';
import { SubcategoryLevelService } from './subcategory-level.service';

interface SubcategoryLevelParams {
  id?: number;
  language_id?: number;
  slug_subcategory_level?: string;
}

/**
 * Get subcategory level detail by ID, language ID, or slug.
 * Supports both GET and POST methods.
 * @param id - Optional subcategory level ID.
 * @param languageId - Optional language ID.
 * @param slugSubcategoryLevel - Optional slug for the subcategory level.
 * @returns Subcategory level detail.
 */
@Controller('v2')
@ApiTags('Subcategory Level')
@ApiBearerAuth()
export class SubcategoryLevelController {
  constructor(
    private readonly subcategoryLevelService: SubcategoryLevelService
  ) {}

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
        id: { type: 'number', required: false },
        language_id: { type: 'number', required: false },
        slug_subcategory_level: { type: 'string', required: false },
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

    return {
      error: false,
      data: subcategoryLevelDetail,
    };
  }
}
