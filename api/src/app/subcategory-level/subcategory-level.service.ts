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
      const cached = await this.redisService.get<SubcategoryLevelDetailDto>(
        cacheKey
      );

      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }

      // Get subcategory level detail with joins
      const query = this.dbService.connection
        .table(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
        .leftJoin(
          CATEGORY_SCHEMA.TABLE,
          `${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.ID}`,
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAINCAT_ID}`
        )
        .leftJoin(
          SUBCATEGORY_SCHEMA.TABLE,
          `${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.ID}`,
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAIN_SUBCAT_ID}`
        )
        .leftJoin(
          WEB_SEO_SCHEMA.TABLE,
          `${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.SLUG}`,
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.SLUG}`
        )
        .where(
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.STATUS}`,
          1
        );

      // Add dynamic filters
      if (params.id) {
        query.where(
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID}`,
          params.id
        );
      }
      if (params.slug) {
        query.where(
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.SLUG}`,
          params.slug
        );
      }
      if (params.languageId) {
        query.where(
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.LANGUAGE_ID}`,
          params.languageId
        );
      }

      // Use JSON_OBJECT for web_seo fields to automatically group them
      // To make sure we get the correct data structure which match the response data of PHP API
      const data = await query
        .select([
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.*`,
          `${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.SLUG} as slug_category`,
          `${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.SLUG} as slug_subcategory`,
          this.dbService.connection.raw(`
            CAST(JSON_OBJECT(
              'id', ${WEB_SEO_SCHEMA.TABLE}.id,
              'language_id', ${WEB_SEO_SCHEMA.TABLE}.language_id,
              'quizz_mode', ${WEB_SEO_SCHEMA.TABLE}.quizz_mode,
              'type', ${WEB_SEO_SCHEMA.TABLE}.type,
              'quizz_by_language_lan_id', ${WEB_SEO_SCHEMA.TABLE}.quizz_by_language_lan_id,
              'maincat_id', ${WEB_SEO_SCHEMA.TABLE}.maincat_id,
              'subcategory_id', ${WEB_SEO_SCHEMA.TABLE}.subcategory_id,
              'subcategory_level_id', ${WEB_SEO_SCHEMA.TABLE}.subcategory_level_id,
              'quizz_id', ${WEB_SEO_SCHEMA.TABLE}.quizz_id,
              'title', ${WEB_SEO_SCHEMA.TABLE}.title,
              'sub_heading', ${WEB_SEO_SCHEMA.TABLE}.sub_heading,
              'slug', ${WEB_SEO_SCHEMA.TABLE}.slug,
              'seo_block', ${WEB_SEO_SCHEMA.TABLE}.seo_block,
              'meta_title', ${WEB_SEO_SCHEMA.TABLE}.meta_title,
              'meta_description', ${WEB_SEO_SCHEMA.TABLE}.meta_description,
              'meta_keyword', ${WEB_SEO_SCHEMA.TABLE}.meta_keyword,
              'schema_markup', ${WEB_SEO_SCHEMA.TABLE}.schema_markup,
              'sponsor_link', ${WEB_SEO_SCHEMA.TABLE}.sponsor_link,
              'sponsor_name', ${WEB_SEO_SCHEMA.TABLE}.sponsor_name,
              'description', ${WEB_SEO_SCHEMA.TABLE}.description,
              'is_edit_slug', ${WEB_SEO_SCHEMA.TABLE}.is_edit_slug,
              'sub_title', ${WEB_SEO_SCHEMA.TABLE}.sub_title,
              'heading', ${WEB_SEO_SCHEMA.TABLE}.heading,
              'enable_faq', ${WEB_SEO_SCHEMA.TABLE}.enable_faq
            ) AS CHAR) as web_seo
          `),
        ])
        .first();

      if (!data) {
        return null;
      }

      // Parse web_seo JSON string to object
      data.web_seo = JSON.parse(data.web_seo);

      // Get FAQ data separately as it's a one-to-many relationship
      const faq = await this.dbService.connection
        .table(FAQ_SCHEMA.TABLE)
        .where({
          type: 3,
          subcategory_level_id: data.id,
          quizz_mode: 1,
        });

      // Transform data to match DTO and response data of PHP API
      const result: SubcategoryLevelDetailDto = transformToString({
        ...data,
        image: data.image
          ? `${BASE_URL}${SUBCATEGORY_LEVEL_IMAGE_PATH}${data.image}`
          : '',
        thumb_image: data.image
          ? `${BASE_URL}${SUBCATEGORY_LEVEL_THUMB_PATH}${data.image}`
          : '',
        faq,
        share_url: this.generateShareUrl(
          data.slug_category,
          data.slug_subcategory,
          data.slug,
          params.languageId
        ),
      });

      // Cache with both keys
      await this.redisService.set(cacheKey, result, 3600);

      // Cache with alternate key
      const altKey = params.id
        ? `${CacheKey.Detail_subcategory_level}language:${params.languageId}:slug:${data.slug}`
        : `${CacheKey.Detail_subcategory_level}language:${params.languageId}:id:${data.id}`;
      await this.redisService.set(altKey, result, 3600);

      this.logger.debug(
        `Cached subcategory level data for ${cacheKey} and ${altKey}`
      );

      return result;
    } catch (error) {
      this.logger.error('Failed to get subcategory level detail', error);
      return null;
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
