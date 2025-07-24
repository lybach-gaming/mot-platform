import { Injectable, Logger } from '@nestjs/common';
import { GetQuestionsQuizHdDto } from './dto/get-questions-quiz-hd.dto';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { transformToString } from '../../common/utils/transform.util';
import { encryptData, urlJoin } from '../../common/utils/string.util';
import {
  BASE_URL,
  QUESTION_IMG_PATH,
  SECRET_KEY_ANSWER,
} from '../../common/constants/app';
import { BOOKMARK_SCHEMA, QUESTION_SCHEMA } from '../../core/database/schemas';
import { CacheKey } from '../../common/constants/cache-key';

@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService
  ) {}

  /**
   * Retrieve a list of quiz questions with full details
   *
   * @param dto - DTO containing question lookup parameters
   * @returns Detailed question info or error response
   */
  async getQuestionsQuizHd(dto: GetQuestionsQuizHdDto) {
    const { category, sub_cat, sub_cat_level, quizzes } = dto;

    const cacheKey = `${CacheKey.GetQuestionsQuizHd}${JSON.stringify(dto)}`;

    // Try getting from cache first
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached;
    }

    const QUIZZ_MODE = 1;
    const secretKeyAnswer = SECRET_KEY_ANSWER;

    const query = this.dbService.connection
      .table(`${QUESTION_SCHEMA.TABLE} as q`)
      .select('q.*')
      .where(`q.${QUESTION_SCHEMA.FIELDS.CATEGORY}`, category)
      .andWhere(`q.${QUESTION_SCHEMA.FIELDS.SUBCATEGORY}`, sub_cat)
      .andWhere(`q.${QUESTION_SCHEMA.FIELDS.SUBCATEGORY_LEVEL}`, sub_cat_level)
      .andWhere(`q.${QUESTION_SCHEMA.FIELDS.QUIZZES}`, quizzes)
      .orderByRaw('rand()');

    if (!dto?.userId) {
      query.select(
        this.dbService.connection.raw(
          `
          (SELECT COUNT(id) FROM ${BOOKMARK_SCHEMA.TABLE} b 
           WHERE b.${BOOKMARK_SCHEMA.FIELDS.QUESTION_ID} = q.id 
             AND ${BOOKMARK_SCHEMA.FIELDS.QUIZZ_MODE} = ? 
             AND b.${BOOKMARK_SCHEMA.FIELDS.USER_ID} = ?) as is_bookmark
        `,
          [QUIZZ_MODE, dto?.userId]
        )
      );
    }

    const data = await query;

    if (!data || data.length === 0) {
      return {
        error: true,
        message: '102',
        data: [],
      };
    }

    const processedData = data.map((q) => ({
      ...q,
      image: q.image ? urlJoin(BASE_URL, QUESTION_IMG_PATH, q.image) : '',
      optiona: q.optiona?.trim() || '',
      optionb: q.optionb?.trim() || '',
      optionc: q.optionc?.trim() || '',
      optiond: q.optiond?.trim() || '',
      optione: q.optione ? q.optione.trim() : '',
      answer: encryptData(secretKeyAnswer, q.answer?.trim() || ''),
      is_bookmark: dto?.userId ? '0' : q.is_bookmark,
    }));

    const response = {
      error: false,
      data: transformToString(processedData),
    };

    await this.redisService.set(cacheKey, response);

    return response;
  }
}
