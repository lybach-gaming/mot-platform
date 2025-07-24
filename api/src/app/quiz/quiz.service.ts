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
import { GetMoreQuizzOfQuizHqDto } from './dto/get-more-quizz-of-quizz-hq.dto';

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
      return cached;
    }

    // Fetch quiz details with related slugs and subqueries for no_of_que & is_played
    const selectFields = [
      'qz.*',
      'cat.slug as slug_category',
      'subcat.slug as slug_subcategory',
      'sublevel.slug as slug_subcategory_level',
      this.dbService.connection.raw(`(
    SELECT COUNT(*) FROM ${QUESTION_SCHEMA.TABLE} q
    WHERE q.${QUESTION_SCHEMA.FIELDS.LANGUAGE_ID} = qz.language_id
      AND q.${QUESTION_SCHEMA.FIELDS.CATEGORY} = qz.maincat_id
      AND q.${QUESTION_SCHEMA.FIELDS.SUBCATEGORY} = qz.main_subcat_id
      AND q.${QUESTION_SCHEMA.FIELDS.SUBCATEGORY_LEVEL} = qz.main_subcat_level_id
      AND q.${QUESTION_SCHEMA.FIELDS.QUIZZES} = qz.id
  ) as no_of_que`),
      this.dbService.connection.raw(`(
    SELECT EXISTS (
      SELECT 1 FROM ${QUIZ_HQ_LEADERBOARD_SCHEMA.TABLE} qhl
      WHERE qhl.${QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.LANGUAGE_ID} = qz.language_id
        AND qhl.${QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.QUIZZ_ID} = qz.id
    )
  ) as is_played`),
    ];

    // Fetch the main quiz record
    const data = await this.dbService.connection
      .from({ qz: QUIZZ_SCHEMA.TABLE })
      .leftJoin(`${CATEGORY_SCHEMA.TABLE} as cat`, 'cat.id', 'qz.maincat_id')
      .leftJoin(
        `${SUBCATEGORY_SCHEMA.TABLE} as subcat`,
        'subcat.id',
        'qz.main_subcat_id'
      )
      .leftJoin(
        `${SUBCATEGORY_LEVEL_SCHEMA.TABLE} as sublevel`,
        'sublevel.id',
        'qz.main_subcat_level_id'
      )
      .select(selectFields)
      .where(`qz.${QUIZZ_SCHEMA.FIELDS.STATUS}`, 1)
      .modify((qb) => {
        // Apply filters based on DTO values
        if (dto.slug_quizzes) {
          qb.where(`qz.${QUIZZ_SCHEMA.FIELDS.SLUG}`, dto.slug_quizzes);
        }
        if (dto.id) {
          qb.where(`qz.${QUIZZ_SCHEMA.FIELDS.ID}`, dto.id);
        }
        if (dto.language_id) {
          qb.where(`qz.${QUIZZ_SCHEMA.FIELDS.LANGUAGE_ID}`, dto.language_id);
        }
      })
      .first();

    if (!data) {
      return {
        error: true,
        message: 'Quiz not found',
        data: null,
      };
    }

    // Fetch SEO details for the quiz
    const webSeo = await this.dbService
      .connection(WEB_SEO_SCHEMA.TABLE)
      .where(WEB_SEO_SCHEMA.FIELDS.QUIZZ_ID, data.id)
      .first();
    data.web_seo = webSeo ?? null;

    // Fetch FAQ items related to the quiz
    const faq = await this.dbService
      .connection(FAQ_SCHEMA.TABLE)
      .where({
        [FAQ_SCHEMA.FIELDS.TYPE]: 4,
        [FAQ_SCHEMA.FIELDS.QUIZZ_ID]: data.id,
        [FAQ_SCHEMA.FIELDS.QUIZZ_MODE]: 1,
      })
      .select('*');
    data.faq = faq;

    // Check if user has completed this quiz
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
          [QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.QUIZZ_ID]: data.id,
        })
        .andWhere('percentage', '>=', 75)
        .count('id as count')
        .first();

      if (completed) {
        is_completed = +completed?.count > 0;
      }
    }
    data.completed = is_completed;

    // Format image URLs and thumbnail paths
    const image = data.image;
    data.image = image ? urlJoin(BASE_URL, QUIZZES_IMG_PATH, image) : '';
    data.thumb_image = image ? urlJoin(BASE_URL, QUIZZES_IMG_PATH, image) : '';

    // Build share URL for frontend usage
    const LANG_ENGLISH_ID = 14;
    const prefix_lang =
      +(dto?.language_id || 0) === LANG_ENGLISH_ID ? '/en' : '/en';
    data.share_url = urlJoin(
      FE_URL,
      prefix_lang,
      QUIZ_HQ_SLUG,
      data.slug_category,
      data.slug_subcategory,
      data.slug_subcategory_level,
      data.slug
    );

    const response = {
      error: false,
      data: {
        ...transformToString(data),
        no_of_que: +data?.no_of_que,
        is_played: !!+data?.is_played,
      },
    };

    await this.redisService.set(cacheKey, response);

    return response;
  }

  async getMoreQuizzOfQuizHq(dto: GetMoreQuizzOfQuizHqDto) {
    const dbService = this.dbService;

    if (!dto.slug_quizzes) {
      return { error: true, message: '101', data: [] };
    }

    const quizz = await this.dbService.connection
      .table(`${QUIZZ_SCHEMA.TABLE} as qz`)
      .where(`qz.${QUIZZ_SCHEMA.FIELDS.SLUG}`, dto.slug_quizzes)
      .first();

    if (!quizz) {
      return { error: true, message: '102', data: [] };
    }

    const maincat_id = quizz.maincat_id;
    const main_subcat_id = quizz.main_subcat_id;
    const main_subcat_level_id = quizz.main_subcat_level_id;

    // fallback 1
    let data = await this.dbService.connection
      .table(`${QUIZZ_SCHEMA.TABLE} as qz`)
      .select(
        `qz.${QUIZZ_SCHEMA.FIELDS.ID} as id_quizz`,
        'qz.*',
        `w.${WEB_SEO_SCHEMA.FIELDS.ID} as id_web_seo`,
        'w.*'
      )
      .leftJoin(`${WEB_SEO_SCHEMA.TABLE} as w`, function () {
        this.on(
          `w.${WEB_SEO_SCHEMA.FIELDS.QUIZZ_ID}`,
          '=',
          `qz.${QUIZZ_SCHEMA.FIELDS.ID}`
        )
          .andOn(
            `w.${WEB_SEO_SCHEMA.FIELDS.MAINCAT_ID}`,
            '=',
            dbService.connection.raw('?', [maincat_id])
          )
          .andOn(
            `w.${WEB_SEO_SCHEMA.FIELDS.SUBCATEGORY_ID}`,
            '=',
            dbService.connection.raw('?', [main_subcat_id])
          )
          .andOn(
            `w.${WEB_SEO_SCHEMA.FIELDS.SUBCATEGORY_LEVEL_ID}`,
            '=',
            dbService.connection.raw('?', [main_subcat_level_id])
          );
      })
      .where(`qz.${QUIZZ_SCHEMA.FIELDS.MAINCAT_ID}`, maincat_id)
      .andWhere(`qz.${QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_ID}`, main_subcat_id)
      .andWhere(
        `qz.${QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_LEVEL_ID}`,
        main_subcat_level_id
      )
      .andWhereNot(`qz.${QUIZZ_SCHEMA.FIELDS.ID}`, quizz.id);

    if (data.length < 5) {
      data = await this.dbService.connection
        .table(`${QUIZZ_SCHEMA.TABLE} as qz`)
        .select(
          `qz.${QUIZZ_SCHEMA.FIELDS.ID} as id_quizz`,
          'qz.*',
          `w.${WEB_SEO_SCHEMA.FIELDS.ID} as id_web_seo`,
          'w.*'
        )
        .leftJoin(`${WEB_SEO_SCHEMA.TABLE} as w`, function () {
          this.on(
            `w.${WEB_SEO_SCHEMA.FIELDS.QUIZZ_ID}`,
            '=',
            `qz.${QUIZZ_SCHEMA.FIELDS.ID}`
          )
            .andOn(
              `w.${WEB_SEO_SCHEMA.FIELDS.MAINCAT_ID}`,
              '=',
              dbService.connection.raw('?', [maincat_id])
            )
            .andOn(
              `w.${WEB_SEO_SCHEMA.FIELDS.SUBCATEGORY_ID}`,
              '=',
              dbService.connection.raw('?', [main_subcat_id])
            );
        })
        .where(`qz.${QUIZZ_SCHEMA.FIELDS.MAINCAT_ID}`, maincat_id)
        .andWhere(`qz.${QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_ID}`, main_subcat_id)
        .andWhereNot(`qz.${QUIZZ_SCHEMA.FIELDS.ID}`, quizz.id);
    }

    // fallback 2
    if (data.length < 5) {
      data = await this.dbService.connection
        .table(`${QUIZZ_SCHEMA.TABLE} as qz`)
        .select(
          `qz.${QUIZZ_SCHEMA.FIELDS.ID} as id_quizz`,
          'qz.*',
          `w.${WEB_SEO_SCHEMA.FIELDS.ID} as id_web_seo`,
          'w.*'
        )
        .leftJoin(`${WEB_SEO_SCHEMA.TABLE} as w`, function () {
          this.on(
            `w.${WEB_SEO_SCHEMA.FIELDS.QUIZZ_ID}`,
            '=',
            `qz.${QUIZZ_SCHEMA.FIELDS.ID}`
          ).andOn(
            `w.${WEB_SEO_SCHEMA.FIELDS.MAINCAT_ID}`,
            '=',
            dbService.connection.raw('?', [maincat_id])
          );
        })
        .where(`qz.${QUIZZ_SCHEMA.FIELDS.MAINCAT_ID}`, maincat_id)
        .andWhereNot(`qz.${QUIZZ_SCHEMA.FIELDS.ID}`, quizz.id);
    }

    let response: {
      error: boolean;
      message?: string;
      data: Array<any>;
    } = {
      error: false,
      message: '102',
      data: [],
    };

    if (data.length > 0) {
      const finalData = data.map((item) => ({
        ...item,
        image: item.image
          ? urlJoin(BASE_URL, QUIZZES_IMG_PATH, item.image)
          : '',
      }));

      response = {
        error: false,
        data: transformToString(finalData),
      };
    }

    return response;
  }
}
