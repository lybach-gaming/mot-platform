import { WebSeoService } from './../web-seo/web-seo.service';
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { CacheKey } from '../../common/constants/cache-key';
import {
  BASE_URL,
  FE_URL,
  QUIZ_HQ_SLUG,
  SUBCATEGORY_IMAGE_PATH,
  SUBCATEGORY_THUMB_PATH,
} from '../../common/constants/app';
import { SubcategoryDetailDto } from './dto/subcategory.dto';
import { transformToString } from '../../common/utils/transform.util';
import {
  CATEGORY_SCHEMA,
  SUBCATEGORY_SCHEMA,
  FAQ_SCHEMA,
  QUESTION_SCHEMA,
} from '../../core/database/schemas';

@Injectable()
export class SubcategoryService {
  private readonly logger = new Logger(SubcategoryService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly webSeoService: WebSeoService
  ) {}

  /**
   * Get subcategory detail with related data
   */
  async getSubcategoryDetail(params: {
    id?: number;
    slug?: string;
    languageId?: number;
  }): Promise<{ error: boolean; data: SubcategoryDetailDto | null }> {
    try {
      // Validate required params
      if (!params.slug && !params.id) {
        return null;
      }

      // Generate cache key based on available parameter
      const cacheKey = params.id
        ? `${CacheKey.Detail_subcategory}language:${params.languageId}:id:${params.id}`
        : `${CacheKey.Detail_subcategory}language:${params.languageId}:slug:${params.slug}`;

      // Try getting from cache first
      const cached = await this.redisService.get<SubcategoryDetailDto>(
        cacheKey
      );

      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }

      // Get subcategory detail
      const query = this.dbService.connection
        .table(SUBCATEGORY_SCHEMA.TABLE)
        .leftJoin(
          CATEGORY_SCHEMA.TABLE,
          `${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.ID}`,
          `${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.MAINCAT_ID}`
        )
        .where(
          `${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.STATUS}`,
          1
        );

      // Add web SEO join using service
      this.webSeoService.addWebSeoJoin(
        query,
        `${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.SLUG}`
      );

      // Add dynamic filters
      if (params.id) {
        query.where(
          `${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.ID}`,
          params.id
        );
      }
      if (params.slug) {
        query.where(
          `${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.SLUG}`,
          params.slug
        );
      }
      if (params.languageId) {
        query.where(
          `${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.LANGUAGE_ID}`,
          params.languageId
        );
      }

      // Use JSON_OBJECT for web_seo fields to automatically group them
      // To make sure we get the correct data structure which match the response data of PHP API
      const data = await query
        .select([
          `${SUBCATEGORY_SCHEMA.TABLE}.*`,
          this.dbService.connection.raw(`(
            SELECT COUNT(${QUESTION_SCHEMA.FIELDS.ID}) 
            FROM ${QUESTION_SCHEMA.TABLE} 
            WHERE ${QUESTION_SCHEMA.FIELDS.SUBCATEGORY} = ${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.ID}
          ) AS no_of_que`),
          this.dbService.connection.raw(`(
            SELECT MAX(CAST(${QUESTION_SCHEMA.FIELDS.LEVEL} AS DECIMAL)) 
            FROM ${QUESTION_SCHEMA.TABLE} 
            WHERE ${QUESTION_SCHEMA.FIELDS.SUBCATEGORY} = ${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.ID}
          ) AS maxlevel`),
          `${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.SLUG} as slug_category`,
          this.webSeoService.getWebSeoSelectQuery(),
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
          type: 2,
          subcategory_id: data.id,
          quizz_mode: 1,
        });

      // Transform data to match DTO
      const result: SubcategoryDetailDto = transformToString({
        ...data,
        image: data.image
          ? `${BASE_URL}${SUBCATEGORY_IMAGE_PATH}${data.image}`
          : '',
        thumb_image: data.image
          ? `${BASE_URL}${SUBCATEGORY_THUMB_PATH}${data.image}`
          : '',
        has_unlocked: 0,
        faq,
        share_url: this.generateShareUrl(
          data.slug_category,
          data.slug,
          params.languageId
        ),
      });

      // Cache the result
      await this.redisService.set(cacheKey, result, 3600);

      // Cache with alternate key
      const altKey = params.id
        ? `${CacheKey.Detail_subcategory}language:${params.languageId}:slug:${data.slug}`
        : `${CacheKey.Detail_subcategory}language:${params.languageId}:id:${data.id}`;
      await this.redisService.set(altKey, result, 3600);

      this.logger.debug(
        `Cached subcategory data for ${cacheKey} and ${altKey}`
      );

      return result;
    } catch (error) {
      this.logger.error('Failed to get subcategory detail', error);
      throw error;
    }
  }

  /**
   * Generate share URL for subcategory
   */
  private generateShareUrl(
    categorySlug?: string,
    subcategorySlug?: string,
    languageId?: number
  ): string {
    const prefixLang = languageId === 14 ? 'en' : '';
    return `${FE_URL}${prefixLang}/${QUIZ_HQ_SLUG}/${categorySlug}/${subcategorySlug}`;
  }
}
