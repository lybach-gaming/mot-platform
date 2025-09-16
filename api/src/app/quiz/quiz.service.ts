import { Injectable, Logger } from '@nestjs/common';
import {
  BASE_URL,
  CACHE_TTL_DEFAULT,
  FE_URL,
  LANG_ENGLISH_ID,
  QUIZ_HQ_SLUG,
  QUIZZES_IMAGE_PATH,
  QUIZZES_THUMB_PATH,
  QUIZZES_THUMB_PATH_SMALL,
  QUESTION_IMG_PATH,
  OrderBy,
  TypeModeGame,
  QuizMode,
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
import { FaqService } from '../faq/faq.service';
import { WebSeoService } from '../web-seo/web-seo.service';
import {
  LANGUAGE_SCHEMA,
  CATEGORY_SCHEMA,
  SUBCATEGORY_SCHEMA,
  SUBCATEGORY_LEVEL_SCHEMA,
  QUIZZ_SCHEMA,
  QUESTION_SCHEMA,
  QUIZ_HQ_LEADERBOARD_SCHEMA,
  QUIZ_RULES_SCHEMA,
  WEB_SEO_SCHEMA,
  FAQ_SCHEMA,
} from '../../core/database/schemas';
import { GetDetailQuizzesDto } from './dto/get-detail-quizzes.dto';
import { GetListQuizDto } from './dto/get-list-quiz.dto';
import { LegacyGetListQuizDto } from './dto/legacy-get-list-quizzes.dto';
import { GetMoreQuizzOfQuizHqDto } from './dto/get-more-quizz-of-quizz-hq.dto';
import { GetQuizRulesDto } from './dto/get-quiz-rules.dto';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { EditQuizDto } from './dto/edit-quiz.dto';
import { QuizSortBy } from './../../common/constants/quiz';
import { generateSlug } from '../../common/utils/generateSlug.util';
import { Knex } from 'knex';
import { IListQuizItemResponse } from './types';
import { IApiListResponse } from '../../common/types/response.type';

const MAX_RELATED_QUIZZES = 5;
const COMPLETED_QUIZ_HQ_MIN_PERCENTAGE = 75;

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly fileUploadService: FileUploadService,
    private readonly faqService: FaqService,
    private readonly webSeoService: WebSeoService
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
      throw new Error(`Failed to upload quiz image:`, { cause: error });
    }
  }

  /**
   * Upload new image and delete old one if exists
   * @param newFile - The new image file to upload
   * @param oldImage - The old image filename to delete
   * @returns The new image filename
   */
  private async uploadNewImageAndDeleteOld(
    newFile: Express.Multer.File,
    oldImage?: string
  ): Promise<string> {
    if (oldImage) {
      await this.fileUploadService.deleteFile(oldImage, QUIZZES_IMAGE_PATH);
    }
    return this.handleImageUpload(newFile);
  }

  /**
   * Build quiz data object from DTO
   * @param dto - The DTO containing quiz data
   * @param existingQuiz - Optional existing quiz data for updates
   * @returns Formatted quiz data object
   */
  private buildQuizDataFromDto(
    dto: Partial<CreateQuizDto>,
    existingQuiz?: any
  ): any {
    const fields = [
      QUIZZ_SCHEMA.FIELDS.QUIZZ_NAME,
      QUIZZ_SCHEMA.FIELDS.LANGUAGE_ID,
      QUIZZ_SCHEMA.FIELDS.MAINCAT_ID,
      QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_ID,
      QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_LEVEL_ID,
      QUIZZ_SCHEMA.FIELDS.SLUG,
      QUIZZ_SCHEMA.FIELDS.STATUS,
      QUIZZ_SCHEMA.FIELDS.IS_PREMIUM,
      QUIZZ_SCHEMA.FIELDS.COINS,
      QUIZZ_SCHEMA.FIELDS.ENABLE_FAQ,
      QUIZZ_SCHEMA.FIELDS.IS_PUBLIC,
      QUIZZ_SCHEMA.FIELDS.IS_FEATURED,
      QUIZZ_SCHEMA.FIELDS.IS_COMING_SOON,
      QUIZZ_SCHEMA.FIELDS.IS_PINNED,
    ];

    const quizData: any = {};

    for (const field of fields) {
      if (dto[field as keyof CreateQuizDto] !== undefined) {
        quizData[field] = dto[field as keyof CreateQuizDto];
      } else if (!existingQuiz && field === QUIZZ_SCHEMA.FIELDS.STATUS) {
        quizData[field] = 1;
      } else if (!existingQuiz && field === QUIZZ_SCHEMA.FIELDS.IS_PREMIUM) {
        quizData[field] = 0;
      } else if (!existingQuiz && field === QUIZZ_SCHEMA.FIELDS.COINS) {
        quizData[field] = 0;
      } else if (!existingQuiz && field === QUIZZ_SCHEMA.FIELDS.ENABLE_FAQ) {
        quizData[field] = 1;
      } else if (!existingQuiz && field === QUIZZ_SCHEMA.FIELDS.IS_PUBLIC) {
        quizData[field] = 1;
      } else if (!existingQuiz && field === QUIZZ_SCHEMA.FIELDS.IS_FEATURED) {
        quizData[field] = 0;
      } else if (
        !existingQuiz &&
        field === QUIZZ_SCHEMA.FIELDS.IS_COMING_SOON
      ) {
        quizData[field] = 0;
      } else if (!existingQuiz && field === QUIZZ_SCHEMA.FIELDS.IS_PINNED) {
        quizData[field] = 0;
      }
    }

    return quizData;
  }

  /**
   * Check if the number of featured quizzes exceeds the limit
   * @param trx - Database transaction object
   * @param quizId - Optional quiz ID to exclude from the count
   */
  private async checkFeaturedLimit(
    trx: Knex.Transaction,
    quizId?: number
  ): Promise<boolean> {
    const featuredCount = await trx(QUIZZ_SCHEMA.TABLE)
      .where(QUIZZ_SCHEMA.FIELDS.IS_FEATURED, true)
      .modify((qb) => {
        if (quizId) {
          qb.andWhereNot(QUIZZ_SCHEMA.FIELDS.ID, quizId);
        }
      })
      .count('* as count')
      .first();

    return parseInt(featuredCount?.count) >= 3;
  }

  /**
   * [Admin] Create a new quiz
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
          const overLimit = await this.checkFeaturedLimit(trx);
          if (overLimit) {
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
          createQuizDto.slug = generateSlug(createQuizDto.slug);
        } else if (createQuizDto.quizz_name) {
          // If no slug is provided, generate it from quiz name
          createQuizDto.slug = generateSlug(createQuizDto.quizz_name);
        }

        // Handle image upload if present
        let imageName = '';
        if (createQuizDto.image_file) {
          imageName = await this.handleImageUpload(createQuizDto.image_file);
        }

        // Extract only the fields that belong to quiz table
        const quizData = this.buildQuizDataFromDto({
          ...createQuizDto,
          image: imageName, // Set image if uploaded
        });
        quizData.row_order = 0; // default

        // Insert the quiz
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
        await this.webSeoService.createWebSeoEntry(
          trx,
          insertedId,
          TypeModeGame.QUIZ,
          createQuizDto,
          QUIZZ_SCHEMA.FIELDS.QUIZZ_NAME // Use 'quizz_name' as title field
        );

        // Create FAQ entries if enabled
        await this.faqService.createFaqEntries(
          trx,
          insertedId,
          TypeModeGame.QUIZ,
          createQuizDto
        );

        // Fetch the created quiz before committing
        const createdQuiz = await trx(QUIZZ_SCHEMA.TABLE)
          .where(QUIZZ_SCHEMA.FIELDS.ID, insertedId)
          .first();

        // Commit transaction after all operations are done
        await trx.commit();

        // Clear relevant caches after successful commit
        try {
          await Promise.all([
            this.redisService.deleteByPattern(`${CacheKey.UserQuiz}*`),
            this.redisService.deleteByPattern(
              `${CacheKey.UserSubcategoryLevel}*`
            ),
            this.redisService.deleteByPattern(`${CacheKey.UserSubcategory}*`),
            this.redisService.deleteByPattern(`${CacheKey.UserCategory}*`),
          ]);
        } catch (error) {
          // Fallback to deleting specific key if deleteByPattern fails
          this.logger.warn(
            'Failed to delete cache by pattern, falling back to single key delete',
            { cause: error }
          );
        }
        if (createQuizDto.is_featured) {
          await this.redisService.deleteByPattern('promoted_game'); // Clear featured quizzes cache
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
      this.logger.error(`Failed to create quiz`, error);
      throw new Error(`Failed to create quiz:`, { cause: error });
    }
  }

  /**
   * [Admin] Edit an existing quiz
   *
   * @param id - ID of the quiz to edit
   * @param editQuizDto - Data for editing the quiz
   * @returns Updated quiz data or error response
   */
  async editQuiz(id: number, dto: EditQuizDto) {
    const trx = await this.dbService.connection.transaction();
    try {
      const existing = await trx(QUIZZ_SCHEMA.TABLE)
        .where(`${QUIZZ_SCHEMA.FIELDS.ID}`, id)
        .first();
      if (!existing) {
        await trx.rollback();
        return { error: true, message: 'Quiz not found', data: null };
      }

      // Check featured limit
      if (
        dto.is_featured !== undefined &&
        dto.is_featured !== existing.is_featured
      ) {
        const overLimit = await this.checkFeaturedLimit(trx, id);
        if (overLimit) {
          await trx.rollback();
          return {
            error: true,
            message: 'You can feature up to 3 quizzes.',
            data: null,
          };
        }
      }

      // Slug: If has no changes, keep existing slug
      if (dto.slug) dto.slug = generateSlug(dto.slug);
      else if (!existing.slug && dto.quizz_name) {
        dto.slug = generateSlug(dto.quizz_name);
      } else dto.slug = existing.slug;

      // Image
      let imageName = existing.image;
      if (dto.image_file) {
        imageName = await this.uploadNewImageAndDeleteOld(
          dto.image_file,
          existing.image
        );
      }

      // Quiz data
      const quizData = this.buildQuizDataFromDto(dto, existing);
      if (imageName !== existing.image) {
        quizData.image = imageName;
      }

      // Update quiz
      if (Object.keys(quizData).length > 0) {
        await trx(QUIZZ_SCHEMA.TABLE)
          .where(`${QUIZZ_SCHEMA.FIELDS.ID}`, id)
          .update(quizData);
      }

      // Update SEO + FAQ
      await this.webSeoService.updateWebSeoEntry(
        trx,
        id,
        TypeModeGame.QUIZ,
        dto,
        QUIZZ_SCHEMA.FIELDS.QUIZZ_NAME // Use 'quizz_name' as title field
      );
      if (dto.enable_faq !== undefined) {
        await this.faqService.updateFaqEntries(trx, id, TypeModeGame.QUIZ, dto);
      }

      // Update questions of the quiz if category or subcategory or subcategory level changed
      if (
        dto.language_id !== undefined ||
        dto.maincat_id !== undefined ||
        dto.main_subcat_id !== undefined ||
        dto.main_subcat_level_id !== undefined
      ) {
        await trx(QUESTION_SCHEMA.TABLE)
          .where(QUESTION_SCHEMA.FIELDS.QUIZZES, id)
          .update({
            [QUESTION_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
            [QUESTION_SCHEMA.FIELDS.CATEGORY]: dto.maincat_id
              ? dto.maincat_id
              : existing.maincat_id,
            [QUESTION_SCHEMA.FIELDS.SUBCATEGORY]: dto.main_subcat_id
              ? dto.main_subcat_id
              : existing.main_subcat_id,
            [QUESTION_SCHEMA.FIELDS.SUBCATEGORY_LEVEL]: dto.main_subcat_level_id
              ? dto.main_subcat_level_id
              : existing.main_subcat_level_id,
          });
      }

      const updatedQuiz = await trx(QUIZZ_SCHEMA.TABLE)
        .where(`${QUIZZ_SCHEMA.FIELDS.ID}`, id)
        .first();
      await trx.commit();

      try {
        await Promise.all([
          this.redisService.deleteByPattern(`${CacheKey.UserQuestion}*`),
          this.redisService.deleteByPattern(`${CacheKey.UserQuiz}*`),
          this.redisService.deleteByPattern(
            `${CacheKey.UserSubcategoryLevel}*`
          ),
          this.redisService.deleteByPattern(`${CacheKey.UserSubcategory}*`),
          this.redisService.deleteByPattern(`${CacheKey.UserCategory}*`),
        ]);
      } catch (error) {
        // Fallback to deleting specific key if deleteByPattern fails
        this.logger.warn(
          'Failed to delete cache by pattern, falling back to single key delete',
          { cause: error }
        );
      }
      if (dto.is_featured) {
        await this.redisService.deleteByPattern('promoted_game');
      }

      return {
        error: false,
        message: 'Quiz updated successfully',
        data: transformToString(updatedQuiz),
      };
    } catch (e) {
      await trx.rollback();
      this.logger.error(`Failed to update quiz with ID ${id}`, e);
      throw new Error(`Failed to update quiz:`, { cause: e });
    }
  }

  /**
   * [Admin] Get all quizzes with pagination and optional search
   * @param query - Query parameters for pagination and search
   * @returns Paginated list of quizzes
   */
  async getAllQuizzes(query: {
    limit: number;
    offset: number;
    search?: string;
    sortBy?: QuizSortBy;
    order?: OrderBy.DESC | OrderBy.ASC;
  }) {
    const {
      limit = 20,
      offset = 0,
      search,
      sortBy = QuizSortBy.ID,
      order = OrderBy.DESC,
    } = query;

    const validSortFields = Object.values(QuizSortBy);
    const sortField = validSortFields.includes(sortBy) ? sortBy : QuizSortBy.ID;

    const db = this.dbService
      .connection(QUIZZ_SCHEMA.TABLE + ' as q')
      .leftJoin(`${LANGUAGE_SCHEMA.TABLE} as l`, 'l.id', 'q.language_id')
      .leftJoin(`${CATEGORY_SCHEMA.TABLE} as c`, 'c.id', 'q.maincat_id')
      .leftJoin(`${SUBCATEGORY_SCHEMA.TABLE} as s`, 's.id', 'q.main_subcat_id')
      .leftJoin(
        `${SUBCATEGORY_LEVEL_SCHEMA.TABLE} as sl`,
        'sl.id',
        'q.main_subcat_level_id'
      )
      .leftJoin(
        function () {
          // Subquery to count number of questions
          this.select('quizzes')
            .count('* as no_of_que')
            .from(`${QUESTION_SCHEMA.TABLE}`)
            .groupBy('quizzes')
            .as('qq');
        },
        'qq.quizzes',
        'q.id'
      )
      .select(
        'q.*',
        'l.language as language_name',
        'c.category_name',
        'c.slug as category_slug',
        's.subcategory_name',
        's.slug as subcategory_slug',
        'sl.subcategory_level_name',
        'sl.slug as subcategory_level_slug',
        this.dbService.connection.raw('IFNULL(qq.no_of_que, 0) as no_of_que')
      );

    // Search by quiz name or slug
    if (search) {
      db.where((builder) => {
        builder
          .where(`q.${QUIZZ_SCHEMA.FIELDS.QUIZZ_NAME}`, 'like', `%${search}%`)
          .orWhere(`q.${QUIZZ_SCHEMA.FIELDS.SLUG}`, 'like', `%${search}%`);
      });
    }

    const totalQuery = db.clone(); // Clone the query for total count

    // Apply sort, limit, offset
    const quizzes = await db
      .orderBy(sortField, order)
      .limit(limit)
      .offset(offset);

    const results = quizzes.map((quiz) => {
      const image = quiz.image
        ? `${BASE_URL}${QUIZZES_IMAGE_PATH}${quiz.image}`
        : null;

      const thumbnail = quiz.image
        ? `${BASE_URL}${QUIZZES_THUMB_PATH_SMALL}${quiz.image}`
        : null;

      const prefixLang = quiz.language_id === 14 ? '/en' : '/en'; // Default to English for now
      const shareUrl = `${FE_URL}${prefixLang}/${QUIZ_HQ_SLUG}/${quiz.category_slug}/${quiz.subcategory_slug}/${quiz.subcategory_level_slug}/${quiz.slug}`;

      return {
        ...quiz,
        image_url: image,
        thumbnail_url: thumbnail,
        share_url: shareUrl,
      };
    });

    const total = await totalQuery.clearSelect().count({ count: '*' }).first();

    return {
      total: Number(total?.count || 0),
      limit,
      offset,
      quizzes: results,
    };
  }

  /**
   * [Admin] Get detailed information about a quiz
   * @param id - ID of the quiz to retrieve
   * @returns Detailed quiz information or error response
   */
  async getQuizDetails(id: number) {
    if (!id) {
      return {
        error: true,
        message: 'Quiz ID is required',
        data: null,
      };
    }
    const trx = await this.dbService.connection.transaction();
    try {
      // Fetch quiz details
      const quiz = await trx(QUIZZ_SCHEMA.TABLE)
        .where(`${QUIZZ_SCHEMA.FIELDS.ID}`, id)
        .first();
      if (!quiz) {
        await trx.rollback();
        return {
          error: true,
          message: 'Quiz not found',
          data: null,
        };
      }

      // Fetch related web SEO data
      const webSeo = await trx(WEB_SEO_SCHEMA.TABLE)
        .where({
          [WEB_SEO_SCHEMA.FIELDS.QUIZZ_ID]: id,
          [WEB_SEO_SCHEMA.FIELDS.TYPE]: 4,
        })
        .first();
      if (!webSeo) {
        await trx.rollback();
        return {
          error: true,
          message: 'Quiz SEO data not found',
          data: null,
        };
      }
      quiz.web_seo = webSeo || null;

      // Fetch FAQ entries related to this quiz
      const faq = await trx(FAQ_SCHEMA.TABLE)
        .where({
          [FAQ_SCHEMA.FIELDS.QUIZZ_ID]: id,
          [FAQ_SCHEMA.FIELDS.TYPE]: TypeModeGame.QUIZ,
        })
        .select('*');
      if (faq) {
        quiz.faq = faq;
      }

      // Format image URLs
      const image = quiz.image
        ? `${BASE_URL}${QUIZZES_IMAGE_PATH}${quiz.image}`
        : null;
      const thumbnail = quiz.image
        ? `${BASE_URL}${QUIZZES_THUMB_PATH_SMALL}${quiz.image}`
        : null;
      quiz.image_url = image;
      quiz.thumbnail_url = thumbnail;

      // Return formatted quiz data
      await trx.commit();
      return {
        error: false,
        message: 'Quiz details retrieved successfully',
        data: transformToString(quiz),
      };
    } catch (error) {
      await trx.rollback();
      this.logger.error(`Failed to retrieve quiz details with ID ${id}`, error);
      throw new Error(`Failed to retrieve quiz details:`, { cause: error });
    }
  }

  /**
   * [Admin] Delete quizzes by IDs
   * @param ids - Array of quiz IDs to delete
   * @returns Success or error response
   */
  private readonly THUMB_SIZES = ['100x100', '64x64', '50x50'];

  private async deleteQuizImages(imageName?: string) {
    if (!imageName) return;
    // Main image
    await this.fileUploadService.deleteFile(imageName, QUIZZES_IMAGE_PATH);
    // Thumbnail
    for (const size of this.THUMB_SIZES) {
      // Depending on the size, delete the corresponding thumbnail
      await this.fileUploadService.deleteFile(
        `thumbs/${size}/${imageName}`,
        QUIZZES_IMAGE_PATH
      );
    }
  }

  private async deleteQuestionImages(imageName?: string) {
    if (!imageName) return;
    await this.fileUploadService.deleteFile(imageName, QUESTION_IMG_PATH);
    for (const size of this.THUMB_SIZES) {
      await this.fileUploadService.deleteFile(
        `thumbs/${size}/${imageName}`,
        QUESTION_IMG_PATH
      );
    }
  }

  async deleteQuizzes(ids: number[]) {
    const trx = await this.dbService.connection.transaction();
    try {
      // 1) Get data to delete
      const quizzes = await trx(QUIZZ_SCHEMA.TABLE)
        .whereIn(QUIZZ_SCHEMA.FIELDS.ID, ids)
        .select(
          QUIZZ_SCHEMA.FIELDS.ID,
          QUIZZ_SCHEMA.FIELDS.IMAGE,
          QUIZZ_SCHEMA.FIELDS.IS_FEATURED
        );

      if (quizzes.length === 0) {
        await trx.rollback();
        return { error: true, message: 'Quiz not found', data: { ids } };
      }

      const existingIds = new Set(
        quizzes.map((q) => Number(q[QUIZZ_SCHEMA.FIELDS.ID]))
      );
      const missing = ids.filter((id) => !existingIds.has(Number(id)));

      // 2) Get all questions related to these quizzes
      const questions = await trx(QUESTION_SCHEMA.TABLE)
        .whereIn(QUESTION_SCHEMA.FIELDS.QUIZZES, [...existingIds])
        .select(
          QUESTION_SCHEMA.FIELDS.ID,
          QUESTION_SCHEMA.FIELDS.IMAGE,
          QUESTION_SCHEMA.FIELDS.QUIZZES
        );

      // 3) Delete data related to quizze
      // 3.1) Delete questions (rows)
      await trx(QUESTION_SCHEMA.TABLE)
        .whereIn(QUESTION_SCHEMA.FIELDS.QUIZZES, [...existingIds])
        .del();

      // 3.2) Delete quizzes (rows)
      await trx(QUIZZ_SCHEMA.TABLE)
        .whereIn(QUIZZ_SCHEMA.FIELDS.ID, [...existingIds])
        .del();

      // 3.3) Delete web_seo (type=4, quizz_mode ∈ [1,2,3,4])
      const quizzModes = [1, 2, 3, 4];
      await this.webSeoService.deleteWebSEOByItem(trx, {
        type: TypeModeGame.QUIZ,
        itemIds: [...existingIds],
        quizModes: quizzModes,
      });

      // 3.4) Delete faq (type=4, quizz_mode ∈ [1,2,3,4])
      await this.faqService.deleteFaqsByItem(trx, {
        type: TypeModeGame.QUIZ,
        itemIds: [...existingIds],
        quizModes: quizzModes,
      });

      // 4) Commit transaction
      await trx.commit();

      // 5) After commit, delete images and cache
      await Promise.all(
        questions.map(async (q) => {
          try {
            await this.deleteQuestionImages(q[QUESTION_SCHEMA.FIELDS.IMAGE]);
          } catch (e) {
            this.logger?.warn?.(
              `Delete question image failed (qId=${q.id})`,
              e
            );
          }
        })
      );

      await Promise.all(
        quizzes.map(async (qz) => {
          try {
            await this.deleteQuizImages(qz[QUIZZ_SCHEMA.FIELDS.IMAGE]);
          } catch (e) {
            this.logger?.warn?.(
              `Delete quiz image failed (quizId=${qz.id})`,
              e
            );
          }
        })
      );

      // 6) Cache
      try {
        await Promise.all([
          this.redisService.deleteByPattern(`${CacheKey.UserQuestion}*`),
          this.redisService.deleteByPattern(`${CacheKey.UserQuiz}*`),
          this.redisService.deleteByPattern(
            `${CacheKey.UserSubcategoryLevel}*`
          ),
          this.redisService.deleteByPattern(`${CacheKey.UserSubcategory}*`),
          this.redisService.deleteByPattern(`${CacheKey.UserCategory}*`),
        ]);
      } catch (error) {
        // Fallback to deleting specific key if deleteByPattern fails
        this.logger.warn(
          'Failed to delete cache by pattern, falling back to single key delete',
          { cause: error }
        );
      }

      const hasFeatured = quizzes.some(
        (q) => Number(q[QUIZZ_SCHEMA.FIELDS.IS_FEATURED]) === 1
      );
      if (hasFeatured) {
        await this.redisService.deleteByPattern('promoted_game');
      }

      return {
        error: false,
        message: `Deleted ${existingIds.size} quiz(es)`,
        data: { deleted: [...existingIds], missing },
      };
    } catch (e) {
      await trx.rollback();
      this.logger.error(`Failed to delete quizzes with IDs ${ids}`, e);
      throw new Error(`Failed to delete quizzes:`, { cause: e });
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
    const cacheKey = `${CacheKey.UserQuizDetail}${JSON.stringify(dto)}`;
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
        [FAQ_SCHEMA.FIELDS.TYPE]: TypeModeGame.QUIZ,
        [FAQ_SCHEMA.FIELDS.QUIZZ_ID]: data.id,
        [FAQ_SCHEMA.FIELDS.QUIZZ_MODE]: QuizMode.QUIZ_HQ,
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

    await this.redisService.set(cacheKey, response, CACHE_TTL_DEFAULT);

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
    const cacheKey = `${CacheKey.UserMoreQuizzes}${JSON.stringify(dto)}`;
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

    await this.redisService.set(cacheKey, response, CACHE_TTL_DEFAULT);

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
    const cacheKey = `${CacheKey.UserQuizRules}${JSON.stringify(dto)}`;
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

    await this.redisService.set(cacheKey, response, CACHE_TTL_DEFAULT);

    return response;
  }

  /**
   * Search quiz
   *
   * @param dto - DTO containing quiz lookup parameters
   * @returns List quiz info or error response
   */
  async getListQuiz(
    dto: GetListQuizDto
  ): Promise<IApiListResponse<IListQuizItemResponse>> {
    // Check cache
    const cacheKey = `${CacheKey.UserSearchQuizzes}${JSON.stringify(dto)}`;
    if (!dto.search) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }
    }

    // Fetch quiz details with related slugs and subqueries for no_of_question & is_played
    const selectFields = [
      'qz.*',
      'cat.slug as slug_category',
      'subcat.slug as slug_subcategory',
      'sublevel.slug as slug_subcategory_level',
      this.dbService.connection.raw(
        'COALESCE(qc.no_of_question, 0) as no_of_question'
      ),
      this.dbService.connection.raw('COALESCE(qhlb.is_played, 0) as is_played'),
    ];

    // Fetch the main quiz record
    const baseQuery = this.dbService.connection
      .from({ qz: QUIZZ_SCHEMA.TABLE })
      .leftJoin(`${CATEGORY_SCHEMA.TABLE} as cat`, 'cat.id', 'qz.maincat_id')
      .leftJoin(
        `${SUBCATEGORY_SCHEMA.TABLE} as subcat`,
        `subcat.${SUBCATEGORY_SCHEMA.FIELDS.ID}`,
        `qz.${QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_ID}`
      )
      .leftJoin(
        `${SUBCATEGORY_LEVEL_SCHEMA.TABLE} as sublevel`,
        `sublevel.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID}`,
        `qz.${QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_LEVEL_ID}`
      )
      .leftJoin(
        this.dbService.connection
          .from({ q: QUESTION_SCHEMA.TABLE })
          .select('q.quizzes')
          .count('* as no_of_question')
          .groupBy('q.quizzes')
          .as('qc'),
        'qc.quizzes',
        `qz.${QUIZZ_SCHEMA.FIELDS.ID}`
      )
      .leftJoin(
        this.dbService.connection
          .from({ qhl: QUIZ_HQ_LEADERBOARD_SCHEMA.TABLE })
          .distinct('qhl.quizz_id')
          .select(this.dbService.connection.raw('1 as is_played'))
          .as('qhlb'),
        `qhlb.${QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.QUIZZ_ID}`,
        `qz.${QUIZZ_SCHEMA.FIELDS.ID}`
      )

      .where(`qz.${QUIZZ_SCHEMA.FIELDS.STATUS}`, 1)
      .modify((qb) => {
        if (dto.languageId) {
          qb.where(`qz.${QUIZZ_SCHEMA.FIELDS.LANGUAGE_ID}`, dto.languageId);
        }

        if (dto.categoryId) {
          qb.where(`qz.${QUIZZ_SCHEMA.FIELDS.MAINCAT_ID}`, dto.categoryId);
        }

        if (dto.subCategoryId) {
          qb.where(
            `qz.${QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_ID}`,
            dto.subCategoryId
          );
        }

        if (dto.subCategoryLevelId) {
          qb.where(
            `qz.${QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_LEVEL_ID}`,
            dto.subCategoryLevelId
          );
        }

        if (dto.search) {
          const keyword = `%${dto.search?.toLowerCase()}%`;
          qb.andWhere((subQb) => {
            subQb
              .whereRaw(`LOWER(qz.${QUIZZ_SCHEMA.FIELDS.QUIZZ_NAME}) LIKE ?`, [
                keyword,
              ])
              .orWhereRaw(`LOWER(qz.${QUIZZ_SCHEMA.FIELDS.SLUG}) LIKE ?`, [
                keyword,
              ]);
          });
        }
      });

    const totalRow = await baseQuery.clone().count({ total: '*' }).first();
    const total = Number(totalRow?.total || 0);

    let quizzes: IListQuizItemResponse[] = await baseQuery
      .clone()
      .select(selectFields)
      .limit(dto.limit)
      .offset(dto.offset)
      .orderBy(dto.sortBy, dto.sortOrder);

    quizzes = quizzes?.map((quiz) => {
      // Format image URLs and thumbnail paths
      const image = quiz.image;
      quiz.image = image ? urlJoin(BASE_URL, QUIZZES_IMAGE_PATH, image) : '';
      quiz.thumb_image = image
        ? urlJoin(BASE_URL, QUIZZES_THUMB_PATH, image)
        : '';

      // Build share URL for frontend usage
      const prefix_lang =
        +(dto?.languageId || 0) === LANG_ENGLISH_ID ? '/en' : '/en';
      quiz.share_url = urlJoin(
        FE_URL,
        prefix_lang,
        QUIZ_HQ_SLUG,
        quiz.slug_category,
        quiz.slug_subcategory,
        quiz.slug_subcategory_level,
        quiz.slug
      );

      quiz.no_of_question = +quiz?.no_of_question;
      quiz.is_played = !!+quiz?.is_played;

      return quiz;
    });

    const response = {
      error: false,
      total: total,
      data: quizzes,
    };

    if (!dto.search) {
      await this.redisService.set(cacheKey, response, CACHE_TTL_DEFAULT);
    }

    return response;
  }

  // Legacy Get List Quiz
  async getListQuizLegacy(dto: LegacyGetListQuizDto) {
    const {
      user_id,
      category,
      sub_cat,
      sub_cat_level = 0,
      language_id,
      is_pinned,
      search,
      limit = 0,
      offset = 0,
    } = dto;

    if (!category || !sub_cat || !language_id) {
      return {
        error: true,
        message: '103',
        msg: 'category and sub_cat is required!',
        data: [],
        has_more: false,
      };
    }

    // TODO: Check cache
    const cacheKey = `${CacheKey.UserQuizList}${JSON.stringify(dto)}`;
    if (!search) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return cached;
      }
    }

    try {
      // Create one transaction for all queries to ensure consistency
      const trx = await this.dbService.connection.transaction();

      try {
        // 1. Get completed quizzes for user if logged in
        const playedQuizzesQuery = user_id
          ? await trx(QUIZ_HQ_LEADERBOARD_SCHEMA.TABLE)
              .select(QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.QUIZZ_ID)
              .where({
                [QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.USER_ID]: user_id,
                [QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.MAINCAT_ID]: category,
                [QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.SUBCATEGORY_ID]: sub_cat,
                [QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.SUBCATEGORY_LEVEL_ID]:
                  sub_cat_level,
              })
              .where('percentage', '>=', COMPLETED_QUIZ_HQ_MIN_PERCENTAGE)
              .groupBy(QUIZ_HQ_LEADERBOARD_SCHEMA.FIELDS.QUIZZ_ID)
          : [];

        const playedQuizIds = playedQuizzesQuery?.map((q) => q.quizz_id);
        const playedQuizIdsStr = playedQuizIds.length
          ? playedQuizIds.join(',')
          : 'NULL';

        // 2. Get total quizzes
        const totalQuery = trx(QUIZZ_SCHEMA.TABLE + ' as q')
          .leftJoin(`${WEB_SEO_SCHEMA.TABLE} as w`, function () {
            this.on('w.quizz_id', '=', 'q.id')
              .andOn('w.maincat_id', '=', trx.raw('?', [category]))
              .andOn('w.subcategory_id', '=', trx.raw('?', [sub_cat]))
              .andOn(
                'w.subcategory_level_id',
                '=',
                trx.raw('?', [sub_cat_level])
              );
          })
          .where({
            'q.status': 1,
            'q.language_id': language_id,
            'q.maincat_id': category,
            'q.main_subcat_id': sub_cat,
            'q.main_subcat_level_id': sub_cat_level,
            'w.quizz_mode': 1, // TYPE_MAIN
          });

        // 3. Get quiz list with all required data in one query
        const quizQuery = trx({ qz: QUIZZ_SCHEMA.TABLE })
          .select([
            // Subquery to count number of questions
            trx.raw(
              `(
              SELECT COUNT(id) 
              FROM ${QUESTION_SCHEMA.TABLE} q 
              WHERE q.category = ? 
              AND q.subcategory = ? 
              AND q.subcategory_level = ?
              AND q.quizzes = qz.id
            ) as no_of_question`,
              [category, sub_cat, sub_cat_level]
            ),
            'qz.id as id_quizz',
            'qz.*',
            'w.id as id_web_seo',
            'w.*',
          ])
          .leftJoin(`${WEB_SEO_SCHEMA.TABLE} as w`, function () {
            this.on('w.quizz_id', '=', 'qz.id')
              .andOn('w.maincat_id', '=', trx.raw('?', [category]))
              .andOn('w.subcategory_id', '=', trx.raw('?', [sub_cat]))
              .andOn(
                'w.subcategory_level_id',
                '=',
                trx.raw('?', [sub_cat_level])
              );
          })
          .where({
            'qz.status': 1,
            'qz.language_id': language_id,
            'qz.maincat_id': category,
            'qz.main_subcat_id': sub_cat,
            'qz.main_subcat_level_id': sub_cat_level,
            'w.quizz_mode': 1, // TYPE_MAIN
          });

        // Apply additional filters
        if (is_pinned === 1 || is_pinned === 0) {
          quizQuery.where('qz.is_pinned', is_pinned);
        }

        if (search) {
          quizQuery.whereRaw('LOWER(qz.quizz_name) LIKE ?', [
            `%${search.toLowerCase()}%`,
          ]);
        }

        // Apply sorting
        quizQuery
          .orderBy('qz.is_pinned', 'DESC')
          .orderByRaw(
            `CASE WHEN qz.id IN (${playedQuizIdsStr}) THEN 1 ELSE 0 END ASC`
          )
          .orderBy('qz.id', 'DESC');

        // Apply pagination
        if (limit > 0) {
          quizQuery.limit(limit).offset(offset);
        }

        // Execute queries in parallel to improve performance
        const [total, quizzes] = await Promise.all([
          totalQuery.count('* as count').first(),
          quizQuery,
        ]);

        const totalQuizzes = Number(total?.count || 0);

        if (quizzes.length > 0) {
          // Transform data
          const data = quizzes.map((quiz) => ({
            ...quiz,
            image: quiz.image
              ? `${BASE_URL}${QUIZZES_IMAGE_PATH}${quiz.image}`
              : '',
            thumb_image: quiz.image
              ? `${BASE_URL}${QUIZZES_THUMB_PATH}${quiz.image}`
              : '',
            completed: playedQuizIds.includes(quiz.id_quizz),
          }));

          const response = {
            error: false,
            data: transformToString(data),
            has_more: offset + limit < totalQuizzes,
          };

          // Cache only if no search term
          if (!search) {
            await this.redisService.set(cacheKey, response, CACHE_TTL_DEFAULT);
          }

          await trx.commit();
          return response;
        }

        await trx.commit();
        return {
          error: false,
          data: [],
          has_more: false,
        };
      } catch (error) {
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      this.logger.error('Failed to get list quizzes', error);
      return {
        error: true,
        message: 'Failed to get list quizzes',
        data: [],
        has_more: false,
      };
    }
  }
}
