import { Controller, Get, Query, ParseIntPipe } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { SubcategoryLevelService } from './subcategory-level.service';

@Controller('/v2')
@ApiTags('Subcategory Level')
@ApiBearerAuth()
export class SubcategoryLevelController {
  constructor(
    private readonly subcategoryLevelService: SubcategoryLevelService
  ) {}

  @Get('get_detail_subcategory_level')
  @ApiOperation({ summary: 'Get subcategory level detail' })
  @ApiQuery({ name: 'id', required: false })
  @ApiQuery({ name: 'language_id', required: false })
  @ApiQuery({ name: 'slug', required: false })
  async getSubcategoryLevelDetail(
    @Query('id', new ParseIntPipe({ optional: true })) id?: number,
    @Query('language_id', new ParseIntPipe({ optional: true }))
    languageId?: number,
    @Query('slug') slug?: string
  ) {
    const subcategoryLevelDetail =
      await this.subcategoryLevelService.getSubcategoryLevelDetail({
        id: id ? Number(id) : undefined,
        languageId: languageId ? Number(languageId) : undefined,
        slug,
      });

    return {
      error: false,
      data: subcategoryLevelDetail,
    };
  }
}
