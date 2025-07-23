import { Injectable, Logger } from '@nestjs/common';
import {
  BASE_URL,
  FE_URL,
  QUIZ_HQ_SLUG,
  QUIZZES_IMG_PATH,
} from '../../common/constants/app';
import { CacheKey } from '../../common/constants/cache-key';
import { urlJoin } from '../../common/utils/string.util';
import { transformToString } from '../../common/utils/transform.util';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { GetDetailQuizzesDto } from './dto/get-detail-quizzes.dto';
import {
  CATEGORY_SCHEMA,
  FAQ_SCHEMA,
  QUIZ_HQ_LEADERBOARD_SCHEMA,
  SUBCATEGORY_LEVEL_SCHEMA,
  SUBCATEGORY_SCHEMA,
  WEB_SEO_SCHEMA,
} from '../../core/database/schemas';
import { QUIZZ_SCHEMA } from '../../core/database/schemas/quizz.schema';
import { QUESTION_SCHEMA } from '../../core/database/schemas/question.schema';

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService
  ) {}

  /**
   * Get detailed information about a quiz
   *
   * @param dto - DTO containing quiz lookup parameters
   * @returns Detailed quiz info or error response
   */
  async getDetailQuizzes(dto: GetDetailQuizzesDto) {
    if (!dto.slug_quizzes && !dto.id) {
      return {
        error: true,
        message: '103',
        msg: 'slug_quizzes is required!',
        data: null,
      };
    }

    // Check cache
    const cacheKey = `${CacheKey.GetDetailQuizzes}${JSON.stringify(dto)}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      // return cached;
    }

    // Build base query
    let query = this.dbService.connection
      .from({ qz: QUIZZ_SCHEMA.TABLE })
      .select('qz.*')
      .where(`qz.${QUIZZ_SCHEMA.FIELDS.STATUS}`, 1);

    if (dto.slug_quizzes) {
      query = query.where(`qz.${QUIZZ_SCHEMA.FIELDS.SLUG}`, dto.slug_quizzes);
    }
    if (dto.id) {
      query = query.where(`qz.${QUIZZ_SCHEMA.FIELDS.ID}`, dto.id);
    }
    if (dto.language_id) {
      query = query.where(
        `qz.${QUIZZ_SCHEMA.FIELDS.LANGUAGE_ID}`,
        dto.language_id
      );
    }

    const data = await query.first();
    if (!data) {
      return {
        error: true,
        message: 'Quiz not found',
        data: null,
      };
    }

    const quiz_id = data.id;

    /**
     * Map related slugs for category, subcategory, and level
     */
    const slug_category = await this.dbService
      .connection(CATEGORY_SCHEMA.TABLE)
      .select(SUBCATEGORY_SCHEMA.FIELDS.SLUG)
      .where(SUBCATEGORY_SCHEMA.FIELDS.ID, data.maincat_id)
      .first();
    data.slug_category = slug_category?.slug ?? null;

    const slug_subcategory = await this.dbService
      .connection(SUBCATEGORY_SCHEMA.TABLE)
      .select(SUBCATEGORY_SCHEMA.FIELDS.SLUG)
      .where(SUBCATEGORY_SCHEMA.FIELDS.ID, data.main_subcat_id)
      .first();
    data.slug_subcategory = slug_subcategory?.slug ?? null;

    const slug_subcategory_level = await this.dbService
      .connection(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
      .select(SUBCATEGORY_LEVEL_SCHEMA.FIELDS.SLUG)
      .where(SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID, data.main_subcat_level_id)
      .first();
    data.slug_subcategory_level = slug_subcategory_level?.slug ?? null;

    /**
     * Format image URLs and thumbnails
     */
    const image = data.image;
    data.image = image ? urlJoin(BASE_URL, QUIZZES_IMG_PATH, image) : '';
    data.thumb_image = image ? urlJoin(BASE_URL, QUIZZES_IMG_PATH, image) : '';

    /**
     * Fetch SEO details and FAQs
     */
    const web_seo = await this.dbService
      .connection(`${WEB_SEO_SCHEMA.TABLE} as w`)
      .select('w.*')
      .where(WEB_SEO_SCHEMA.FIELDS.SLUG, data.slug)
      .first();
    data.web_seo = web_seo ?? null;

    const faq = await this.dbService
      .connection(`${FAQ_SCHEMA.TABLE} as faq`)
      .where({
        [FAQ_SCHEMA.FIELDS.TYPE]: 4,
        [FAQ_SCHEMA.FIELDS.QUIZZ_ID]: quiz_id,
        [FAQ_SCHEMA.FIELDS.QUIZZ_MODE]: 1,
      })
      .select('*');
    data.faq = faq;

    /**
     * Build share URL for the quiz
     */
    const LANG_ENGLISH_ID = 14;
    const prefix_lang =
      +(dto?.language_id || 0) === LANG_ENGLISH_ID ? '/en' : '/en'; // Defaulting to English
    data.share_url = urlJoin(
      FE_URL,
      prefix_lang,
      QUIZ_HQ_SLUG,
      data.slug_category,
      data.slug_subcategory,
      data.slug_subcategory_level,
      data.slug
    );

    /**
     * Count number of questions in this quiz
     */
    const no_of_que = await this.dbService
      .connection(`${QUESTION_SCHEMA.TABLE} as q`)
      .where({
        [`q.${QUESTION_SCHEMA.FIELDS.LANGUAGE_ID}`]: data.language_id,
        [`q.${QUESTION_SCHEMA.FIELDS.CATEGORY}`]: data.maincat_id,
        [`q.${QUESTION_SCHEMA.FIELDS.SUBCATEGORY}`]: data.main_subcat_id,
        [`q.${QUESTION_SCHEMA.FIELDS.SUBCATEGORY_LEVEL}`]:
          data.main_subcat_level_id,
        [`q.${QUESTION_SCHEMA.FIELDS.QUIZZES}`]: quiz_id,
      })
      .count('* as count')
      .first();
    data.no_of_que = no_of_que?.count ?? 0;

    /**
     * Check if quiz has been played or completed by user
     */
    const is_played = await this.dbService
      .connection(`${QUIZ_HQ_LEADERBOARD_SCHEMA.TABLE} as qhl`)
      .where({
        [`qhl.${QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.LANGUAGE_ID}`]:
          data.language_id,
        [`qhl.${QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.MAINCAT_ID}`]:
          data.maincat_id,
        [`qhl.${QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.SUBCATEGORY_ID}`]:
          data.main_subcat_id,
        [`qhl.${QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.SUBCATEGORY_LEVEL_ID}`]:
          data.main_subcat_level_id,
        [`qhl.${QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.QUIZZ_ID}`]: quiz_id,
      })
      .first();
    data.is_played = !!is_played;

    let is_completed = false;
    if (dto.userId) {
      const completed = await this.dbService
        .connection(QUIZ_HQ_LEADERBOARD_SCHEMA.TABLE)
        .where({
          [QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.USER_ID]: dto.userId,
          [QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.LANGUAGE_ID]: data.language_id,
          [QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.MAINCAT_ID]: data.maincat_id,
          [QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.SUBCATEGORY_ID]:
            data.main_subcat_id,
          [QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.SUBCATEGORY_LEVEL_ID]:
            data.main_subcat_level_id,
          [QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.QUIZZ_ID]: quiz_id,
        })
        .andWhere('percentage', '>=', 75)
        .count('id as count')
        .first();
      if (completed?.count) {
        is_completed = +completed?.count > 0;
      }
    }
    data.completed = is_completed;

    /**
     * Transform data to string-safe types and return response
     */
    const response = {
      error: false,
      data: {
        ...transformToString(data),
        no_of_que: +data?.no_of_que,
      },
    };

    await this.redisService.set(cacheKey, response);

    return response;
  }
}
