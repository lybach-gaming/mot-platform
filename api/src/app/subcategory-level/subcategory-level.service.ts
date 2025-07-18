import { FE_URL, QUIZ_HQ_SLUG } from './../../common/constants/app';
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { CacheKey } from '../../common/constants/cache-key';
import {
  BASE_URL,
  FE_URL,
  QUIZ_HQ_SLUG,
  SUBCATEGORY_LEVEL_IMAGE_PATH,
  SUBCATEGORY_LEVEL_THUMB_PATH,
} from '../../common/constants/app';
import { SubcategoryLevelDetailDto } from './dto/subcategory-level.dto';
import { transformToString } from '../../common/utils/transform.util';

@Injectable()
export class SubcategoryLevelService {
  private readonly logger = new Logger(SubcategoryLevelService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService
  ) {}

  /**
   * Get subcategory level detail with related data
   */
  async getSubcategoryLevelDetail(params: {
    id?: number;
    slug?: string;
    languageId?: number;
  }): Promise<{ error: boolean; data: SubcategoryLevelDetailDto | null }> {
    try {
      // Validate required params
      if (!params.slug && !params.id) {
        return null;
      }

      // Try getting from cache first
      const cacheKey = `${CacheKey.Detail_subcategory_level}language:${
        params.languageId
      }:id:${params.id || params.slug}`;
      const cached = await this.redisService.get<SubcategoryLevelDetailDto>(
        cacheKey
      );

      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }

      // Build base query
      const query = this.dbService.connection
        .select('sl.*')
        .from('tbl_subcategory_level as sl')
        .where('sl.status', 1);

      // Add conditions
      if (params.slug) {
        query.where('sl.slug', params.slug);
      }
      if (params.id) {
        query.where('sl.id', params.id);
      }
      if (params.languageId) {
        query.where('sl.language_id', params.languageId);
      }

      const subcategoryLevel = await query.first();

      if (!subcategoryLevel) {
        return null;
      }

      // Get related data in parallel
      const [category, subcategory, webSeo, faq] = await Promise.all([
        // Get category slug
        this.dbService.connection
          .select('slug')
          .from('tbl_category')
          .where('id', subcategoryLevel.maincat_id)
          .first(),

        // Get subcategory slug
        this.dbService.connection
          .select('slug')
          .from('tbl_subcategory')
          .where('id', subcategoryLevel.main_subcat_id)
          .first(),

        // Get web SEO details
        this.dbService.connection
          .select('w.*')
          .from('tbl_web_seo as w')
          .where('slug', subcategoryLevel.slug)
          .first(),

        // Get FAQ details
        this.dbService.connection
          .select('*')
          .from('tbl_faq as faq')
          .where('type', 3)
          .where('subcategory_level_id', subcategoryLevel.id)
          .where('quizz_mode', 1),
      ]);

      // Transform data to match DTO
      const result: SubcategoryLevelDetailDto = transformToString({
        ...subcategoryLevel,
        image: subcategoryLevel.image
          ? `${BASE_URL}${SUBCATEGORY_LEVEL_IMAGE_PATH}${subcategoryLevel.image}`
          : '',
        thumb_image: subcategoryLevel.image
          ? `${BASE_URL}${SUBCATEGORY_LEVEL_THUMB_PATH}${subcategoryLevel.image}`
          : '',
        slug_category: category?.slug,
        slug_subcategory: subcategory?.slug,
        web_seo: webSeo,
        faq: faq,
        share_url: this.generateShareUrl(
          category?.slug,
          subcategory?.slug,
          subcategoryLevel.slug,
          params.languageId
        ),
      });

      // Cache the result
      await this.redisService.set(cacheKey, result, 3600);
      this.logger.debug(`Cached subcategory level data for ${cacheKey}`);

      return result;
    } catch (error) {
      this.logger.error('Failed to get subcategory level detail', error);
      throw error;
    }
  }

  /**
   * Generate share URL for subcategory level
   */
  private generateShareUrl(
    categorySlug?: string,
    subcategorySlug?: string,
    levelSlug?: string,
    languageId?: number
  ): string {
    const prefixLang = languageId === 14 ? 'en' : '';
    return `${FE_URL}${prefixLang}/${QUIZ_HQ_SLUG}/${categorySlug}/${subcategorySlug}/${levelSlug}`;
  }
}
