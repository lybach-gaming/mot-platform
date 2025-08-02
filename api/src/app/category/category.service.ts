import { WebSeoService } from './../web-seo/web-seo.service';
import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { CacheKey } from '../../common/constants/cache-key';
import {
  BASE_URL,
  FE_URL,
  QUIZ_HQ_SLUG,
  CATEGORY_IMAGE_PATH,
  CATEGORY_THUMB_PATH,
} from '../../common/constants/app';
import { CategoryDetailDto } from './dto/category.dto';
import { transformToString } from '../../common/utils/transform.util';
import {
  CATEGORY_SCHEMA,
  SUBCATEGORY_SCHEMA,
  FAQ_SCHEMA,
  QUESTION_SCHEMA,
} from '../../core/database/schemas';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly webSeoService: WebSeoService
  ) {}

  /**
   * Get category detail with related data
   */
  async getCategoryDetail(params: {
    id?: number;
    slug?: string;
    languageId?: number;
  }): Promise<{ error: boolean; data: CategoryDetailDto | null }> {
    try {
      // Validate required params
      if (!params.slug && !params.id) {
        return null;
      }

      // Generate cache key based on available parameter
      const cacheKey = params.id
        ? `${CacheKey.Detail_category}language:${params.languageId}:id:${params.id}`
        : `${CacheKey.Detail_category}language:${params.languageId}:slug:${params.slug}`;

      // Try getting from cache first
      const cached = await this.redisService.get<CategoryDetailDto>(cacheKey);

      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }

      // Get category detail with counts and web SEO
      const query = this.dbService.connection
        .table(CATEGORY_SCHEMA.TABLE)
        .where(`${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.TYPE}`, 1);

      // Add web SEO join using service
      this.webSeoService.addWebSeoJoin(
        query,
        `${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.SLUG}`
      );

      // Add dynamic filters
      if (params.slug) {
        query.where(
          `${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.SLUG}`,
          params.slug
        );
      }
      if (params.id) {
        query.where(
          `${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.ID}`,
          params.id
        );
      }
      if (params.languageId) {
        query.where(
          `${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.LANGUAGE_ID}`,
          params.languageId
        );
      }

      // Use JSON_OBJECT for web_seo fields to automatically group them
      // To make sure we get the correct data structure which match the response data of PHP API
      const data = await query
        .select([
          `${CATEGORY_SCHEMA.TABLE}.*`,
          this.dbService.connection.raw(`(
            SELECT COUNT(${SUBCATEGORY_SCHEMA.FIELDS.ID}) 
            FROM ${SUBCATEGORY_SCHEMA.TABLE}
            WHERE ${SUBCATEGORY_SCHEMA.FIELDS.MAINCAT_ID} = ${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.ID}
            AND ${SUBCATEGORY_SCHEMA.FIELDS.STATUS} = 1
          ) AS no_of`),
          this.dbService.connection.raw(`(
            SELECT COUNT(${QUESTION_SCHEMA.FIELDS.ID}) 
            FROM ${QUESTION_SCHEMA.TABLE} 
            WHERE ${QUESTION_SCHEMA.FIELDS.CATEGORY} = ${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.ID}
          ) AS no_of_que`),
          this.dbService.connection.raw(`(
            SELECT MAX(CAST(${QUESTION_SCHEMA.FIELDS.LEVEL} AS DECIMAL)) 
            FROM ${QUESTION_SCHEMA.TABLE} 
            WHERE ${QUESTION_SCHEMA.FIELDS.CATEGORY} = ${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.ID}
          ) AS maxlevel`),
          this.webSeoService.getWebSeoSelectQuery(),
        ])
        .first();

      if (!data) {
        return null;
      }

      // Get FAQ details
      const faq = await this.dbService.connection
        .table(FAQ_SCHEMA.TABLE)
        .where({
          type: 1,
          maincat_id: data.id,
          quizz_mode: 1,
        });

      // Parse web_seo JSON string to object
      data.web_seo = JSON.parse(data.web_seo);

      // Transform data to match DTO and response data of PHP API
      const result: CategoryDetailDto = transformToString({
        ...data,
        image: data.image
          ? `${BASE_URL}${CATEGORY_IMAGE_PATH}${data.image}`
          : '',
        thumb_image: data.image
          ? `${BASE_URL}${CATEGORY_THUMB_PATH}${data.image}`
          : '',
        no_of: data.no_of?.toString() || '0',
        no_of_que: data.no_of_que?.toString() || '0',
        maxlevel: data.no_of === 0 ? data.maxlevel?.toString() || '0' : '0',
        faq: faq,
        share_url: this.generateShareUrl(data.slug, params.languageId),
      });

      // Cache the result
      await this.redisService.set(cacheKey, result);

      // Cache with alternate key
      const altKey = params.id
        ? `${CacheKey.Detail_category}language:${params.languageId}:slug:${data.slug}`
        : `${CacheKey.Detail_category}language:${params.languageId}:id:${data.id}`;
      await this.redisService.set(altKey, result);

      this.logger.debug(
        `Cached category data for ${cacheKey} and ${altKey}`
      );

      return result;
    } catch (error) {
      this.logger.error('Failed to get category detail', error);
      return null;
    }
  }

  /**
   * Generate share URL for category
   */
  private generateShareUrl(categorySlug?: string, languageId?: number): string {
    const prefixLang = languageId === 14 ? 'en' : '';
    return `${FE_URL}${prefixLang}/${QUIZ_HQ_SLUG}/${categorySlug}`;
  }
}
