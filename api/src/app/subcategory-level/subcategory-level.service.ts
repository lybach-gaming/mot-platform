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
import {
  SUBCATEGORY_LEVEL_SCHEMA,
  CATEGORY_SCHEMA,
  SUBCATEGORY_SCHEMA,
  WEB_SEO_SCHEMA,
  FAQ_SCHEMA,
} from '../../core/database/schemas';

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

      // Generate cache key based on available parameter
      const cacheKey = params.id
        ? `${CacheKey.Detail_subcategory_level}language:${params.languageId}:id:${params.id}`
        : `${CacheKey.Detail_subcategory_level}language:${params.languageId}:slug:${params.slug}`;

      // Try getting from cache first
      const cached = await this.redisService.get<SubcategoryLevelDetailDto>(cacheKey);

      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }

      // Get subcategory level detail
      const subcategoryLevel = await this.dbService.connection
        .table(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
        .where({ status: 1 })
        .modify((queryBuilder) => {
          if (params.slug) {
            queryBuilder.where({ slug: params.slug });
          }
          if (params.id) {
            queryBuilder.where({ id: params.id });
          }
          if (params.languageId) {
            queryBuilder.where({ language_id: params.languageId });
          }
        })
        .first();

      if (!subcategoryLevel) {
        return null;
      }

      // Get related data in parallel
      const [category, subcategory, webSeo, faq] = await Promise.all([
        // Get category slug
        this.dbService.connection
          .table(CATEGORY_SCHEMA.TABLE)
          .where({ id: subcategoryLevel.maincat_id })
          .first(CATEGORY_SCHEMA.FIELDS.SLUG),

        // Get subcategory slug
        this.dbService.connection
          .table(SUBCATEGORY_SCHEMA.TABLE)
          .where({ id: subcategoryLevel.main_subcat_id })
          .first(SUBCATEGORY_SCHEMA.FIELDS.SLUG),

        // Get web SEO details
        this.dbService.connection
          .table(WEB_SEO_SCHEMA.TABLE)
          .where({ slug: subcategoryLevel.slug })
          .first(),

        // Get FAQ details
        this.dbService.connection
          .table(FAQ_SCHEMA.TABLE)
          .where({
            type: 3,
            subcategory_level_id: subcategoryLevel.id,
            quizz_mode: 1,
          }),
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

      // Cache with both keys
      await this.redisService.set(cacheKey, result, 3600);

      // Cache with alternate key
      const altKey = params.id
        ? `${CacheKey.Detail_subcategory_level}language:${params.languageId}:slug:${subcategoryLevel.slug}`
        : `${CacheKey.Detail_subcategory_level}language:${params.languageId}:id:${subcategoryLevel.id}`;
      await this.redisService.set(altKey, result, 3600);

      this.logger.debug(`Cached subcategory level data for ${cacheKey} and ${altKey}`);

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
