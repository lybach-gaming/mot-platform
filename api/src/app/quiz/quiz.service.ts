import { Injectable } from '@nestjs/common';
import {
  BASE_URL,
  FE_URL,
  QUIZ_HQ_SLUG,
  QUIZZES_IMAGE_PATH,
  QUIZZES_THUMB_PATH,
} from '../../common/constants/app';
import { CacheKey } from '../../common/constants/cache-key';
import { urlJoin } from '../../common/utils/string.util';
import { transformToString } from '../../common/utils/transform.util';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import {
  FileUploadService,
  FileUploadOptions,
} from '../../core/file-upload/file-upload.service';
import {
  CATEGORY_SCHEMA,
  FAQ_SCHEMA,
  QUIZ_HQ_LEADERBOARD_SCHEMA,
  QUIZ_RULES_SCHEMA,
  SUBCATEGORY_LEVEL_SCHEMA,
  SUBCATEGORY_SCHEMA,
  WEB_SEO_SCHEMA,
} from '../../core/database/schemas';
import { QUESTION_SCHEMA } from '../../core/database/schemas/question.schema';
import { QUIZZ_SCHEMA } from '../../core/database/schemas/quizz.schema';
import { GetDetailQuizzesDto } from './dto/get-detail-quizzes.dto';
import { GetQuizRulesDto } from './dto/get-quiz-rules.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { GetMoreQuizzOfQuizHqDto } from './dto/get-more-quizz-of-quizz-hq.dto';

const MAX_RELATED_QUIZZES = 5;

@Injectable()
export class QuizService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly fileUploadService: FileUploadService
  ) {}

  /**
   * Handle image upload for quiz
   * @param file - The uploaded image file
   * @returns The saved image filename
   */
  private async handleImageUpload(file: Express.Multer.File): Promise<string> {
    try {
      const options: FileUploadOptions = {
        directory: QUIZZES_IMAGE_PATH,
        generateThumbnail: true,
        allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
      };

      return await this.fileUploadService.uploadFile(file, options);
    } catch (error) {
      throw new Error(`Failed to upload quiz image: ${error.message}`);
    }
  }

  /**
   * Create FAQ entries for a quiz
   */
  private async createFaqEntries(
    trx: any,
    quizId: number,
    createQuizDto: CreateQuizDto
  ) {
    if (
      !createQuizDto.enable_faq ||
      !createQuizDto.questions?.length ||
      !createQuizDto.answers?.length
    ) {
      return;
    }

    const questions = createQuizDto.questions.filter((q) => q.trim());
    const answers = createQuizDto.answers.filter((a) => a.trim());

    const faqData = questions
      .map((question, index) => {
        const answer = answers[index];
        if (!question || !answer) return null;

        return {
          language_id: createQuizDto.language_id,
          maincat_id: createQuizDto.maincat_id,
          subcategory_id: createQuizDto.main_subcat_id,
          subcategory_level_id: createQuizDto.main_subcat_level_id || 0,
          quizz_id: quizId,
          quizz_mode: createQuizDto.type,
          type: 4,
          question: question,
          answer: answer,
        };
      })
      .filter(Boolean);

    if (faqData.length) {
      await trx(FAQ_SCHEMA.TABLE).insert(faqData);
    }
  }

  /**
   * Create web SEO entry for a quiz
   */
  private async createWebSeoEntry(
    trx: any,
    quizId: number,
    createQuizDto: CreateQuizDto
  ) {
    if (!createQuizDto.web_seo) return;

    const webSeoData = {
      language_id: createQuizDto.language_id,
      maincat_id: createQuizDto.maincat_id,
      subcategory_id: createQuizDto.main_subcat_id,
      subcategory_level_id: createQuizDto.main_subcat_level_id || 0,
      quizz_id: quizId,
      quizz_mode: createQuizDto.quiz_mode,
      type: 4,
      slug: createQuizDto.slug,
      title: createQuizDto.quizz_name,
      ...createQuizDto.web_seo,
    };

    await trx(WEB_SEO_SCHEMA.TABLE).insert(webSeoData);
  }

  /**
   * Create a new quiz
   *
   * @param createQuizDto - Data for creating the quiz
   * @returns Created quiz data or error response
   */
  async createQuiz(createQuizDto: CreateQuizDto) {
    try {
      // Start transaction
      const trx = await this.dbService.connection.transaction();

      try {
        // Check featured quiz limit if quiz is featured
        if (createQuizDto.is_featured) {
          const featuredCount = await trx(QUIZZ_SCHEMA.TABLE)
            .where(QUIZZ_SCHEMA.FIELDS.IS_FEATURED, true)
            .count('* as count')
            .first();

          if (parseInt(featuredCount?.count) >= 3) {
            await trx.rollback();
            return {
              error: true,
              message:
                'You can feature up to 3 quizzes. Please unfeature one before featuring another.',
              data: null,
            };
          }
        }

        // Generate and format slug
        if (createQuizDto.slug) {
          // If slug is provided, format it
          createQuizDto.slug = createQuizDto.slug
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        } else {
          // Generate slug from quiz name
          createQuizDto.slug = createQuizDto.quizz_name
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }

        // Handle image upload if present
        let imageName = '';
        if (createQuizDto.image_file) {
          imageName = await this.handleImageUpload(createQuizDto.image_file);
        }

        // Extract only the fields that belong to quiz table
        const quizData = {
          quizz_name: createQuizDto.quizz_name,
          language_id: createQuizDto.language_id,
          maincat_id: createQuizDto.maincat_id,
          main_subcat_id: createQuizDto.main_subcat_id,
          main_subcat_level_id: createQuizDto.main_subcat_level_id,
          slug: createQuizDto.slug,
          status: createQuizDto.status ?? 1,
          is_premium: createQuizDto.is_premium ?? 0,
          coins: createQuizDto.coins ?? 0,
          enable_faq: createQuizDto.enable_faq ?? 1,
          is_public: createQuizDto.is_public ?? 1,
          is_featured: createQuizDto.is_featured ?? 0,
          is_coming_soon: createQuizDto.is_coming_soon ?? 0,
          is_pinned: createQuizDto.is_pinned ?? 0,
          image: imageName,
          row_order: 0,
        }; // Insert the quiz
        const [insertedId] = await trx(QUIZZ_SCHEMA.TABLE)
          .insert(quizData)
          .returning(QUIZZ_SCHEMA.FIELDS.ID);

        if (!insertedId) {
          await trx.rollback();
          return {
            error: true,
            message: 'Failed to create quiz',
            data: null,
          };
        }

        // Insert web SEO data
        await this.createWebSeoEntry(trx, insertedId, createQuizDto);

        // Create FAQ entries if enabled
        await this.createFaqEntries(trx, insertedId, createQuizDto);

        // Fetch the created quiz before committing
        const createdQuiz = await trx(QUIZZ_SCHEMA.TABLE)
          .where(QUIZZ_SCHEMA.FIELDS.ID, insertedId)
          .first();

        // Commit transaction after all operations are done
        await trx.commit();

        // Clear relevant caches after successful commit
        await this.redisService.del(CacheKey.GetDetailQuizzes);
        if (createQuizDto.is_featured) {
          await this.redisService.delByPattern('promoted_game'); // Clear featured quizzes cache
        }

        // TODO: Send notification if is_send_notice is true
        // Will implement in separate notification service

        return {
          error: false,
          message: 'Quiz created successfully',
          data: transformToString(createdQuiz),
        };
      } catch (trxError) {
        await trx.rollback();
        throw trxError;
      }
    } catch (error) {
      return {
        error: true,
        message: error.message || 'Failed to create quiz',
        data: null,
      };
    }
  }

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
    data.image = image ? urlJoin(BASE_URL, QUIZZES_IMAGE_PATH, image) : '';
    data.thumb_image = image
      ? urlJoin(BASE_URL, QUIZZES_THUMB_PATH, image)
      : '';

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

  /**
   * Get more related quizzes based on a given quiz slug.
   * Find up to MAX_RELATED_QUIZZES quizzes that share the same
   * category, subcategory, and level as the original quiz.
   *
   * @param dto - DTO containing `slug_quizzes` to find similar quizzes
   * @returns An object with error flag, optional message, and a list of related quizzes
   */
  async getMoreQuizzOfQuizHq(dto: GetMoreQuizzOfQuizHqDto) {
    // Check cache
    const cacheKey = `${CacheKey.GetDetailQuizzes}${JSON.stringify(dto)}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return cached;
    }

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

    const quizzes: any[] = [];

    // fallback 1
    const exactMatches = await this.dbService.connection
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
      .andWhereNot(`qz.${QUIZZ_SCHEMA.FIELDS.ID}`, quizz.id)
      .limit(MAX_RELATED_QUIZZES);

    quizzes.push(...exactMatches);

    if (quizzes.length < MAX_RELATED_QUIZZES) {
      const subcategoryMatches = await this.dbService.connection
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
        .andWhereNot(`qz.${QUIZZ_SCHEMA.FIELDS.ID}`, quizz.id)
        .limit(MAX_RELATED_QUIZZES - quizzes.length);

      quizzes.push(...subcategoryMatches);
    }

    // fallback 2
    if (quizzes.length < MAX_RELATED_QUIZZES) {
      const categoryMatches = await this.dbService.connection
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
        .andWhereNot(`qz.${QUIZZ_SCHEMA.FIELDS.ID}`, quizz.id)
        .limit(MAX_RELATED_QUIZZES - quizzes.length);

      quizzes.push(...categoryMatches);
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

    if (quizzes.length > 0) {
      const finalData = quizzes.map((item) => ({
        ...item,
        image: item.image
          ? urlJoin(BASE_URL, QUIZZES_IMAGE_PATH, item.image)
          : '',
      }));

      response = {
        error: false,
        data: transformToString(finalData),
      };
    }

    await this.redisService.set(cacheKey, response);

    return response;
  }

  /**
   * Get quiz rules based on quiz mode
   *
   * @param dto - DTO containing quizz_mode for filtering rules
   * @returns Quiz rule data or error response
   */
  async getQuizRules(dto: GetQuizRulesDto) {
    // Check cache
    const cacheKey = `${CacheKey.GetQuizRules}${JSON.stringify(dto)}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return cached;
    }

    if (!dto.quizz_mode) {
      return {
        error: true,
        message: '102',
      };
    }

    const result = await this.dbService.connection
      .table(QUIZ_RULES_SCHEMA.TABLE)
      .select('*')
      .where(QUIZ_RULES_SCHEMA.FIELDS.QUIZZ_MODE, dto.quizz_mode)
      .first();

    let response = {
      error: true,
      message: '104',
      data: null,
    };

    if (result) {
      response = {
        error: false,
        message: '103',
        data: transformToString(result),
      };
    }

    await this.redisService.set(cacheKey, response);

    return response;
  }
}
