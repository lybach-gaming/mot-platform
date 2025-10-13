import { QuestionSortBy } from './../../common/constants/question';
import { Injectable, Logger } from '@nestjs/common';
import { GetQuestionsQuizHdDto } from './dto/get-questions-quiz-hd.dto';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { transformToString } from '../../common/utils/transform.util';
import { encryptData, urlJoin } from '../../common/utils/string.util';
import { isValidId } from '../../common/utils/number.util';
import {
  BASE_URL,
  CACHE_TTL_MIN,
  QUESTION_IMG_PATH,
  QUESTION_THUMB_PATH_SMALL,
  QUIZZES_IMAGE_PATH,
  SECRET_KEY_ANSWER,
  OrderBy,
} from '../../common/constants/app';
import {
  BOOKMARK_SCHEMA,
  QUESTION_SCHEMA,
  LANGUAGE_SCHEMA,
  CATEGORY_SCHEMA,
  SUBCATEGORY_SCHEMA,
  SUBCATEGORY_LEVEL_SCHEMA,
  QUIZZ_SCHEMA,
} from '../../core/database/schemas';
import { CacheKey } from '../../common/constants/cache-key';
import {
  FileUploadService,
  FileUploadOptions,
} from '../../core/file-upload/file-upload.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { BatchCreateQuestionDto } from './dto/batch-create-question.dto';
import { EditQuestionDto } from './dto/edit-question.dto';

@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);
  private readonly MAX_BATCH_SIZE = 100; // Limit questions/batch

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly fileUploadService: FileUploadService
  ) {}

  /**
   * Prepare question data for database insertion
   * @param question Question DTO with data to prepare
   * @returns Prepared question data ready for insertion
   */
  private async prepareQuestionData(question: CreateQuestionDto): Promise<any> {
    // Handle image upload if present
    let imageName = '';
    if (question.image_file) {
      imageName = await this.handleImageUpload(question.image_file);
    }

    // Process options based on question type
    const optionc = question.question_type === 1 ? question.optionc : '';
    const optiond = question.question_type === 1 ? question.optiond : '';
    const optione = question.question_type === 1 ? question.optione : '';

    // Return prepared data
    return {
      [QUESTION_SCHEMA.FIELDS.CATEGORY]: question.category,
      [QUESTION_SCHEMA.FIELDS.SUBCATEGORY]: question.subcategory,
      [QUESTION_SCHEMA.FIELDS.SUBCATEGORY_LEVEL]: question.subcategory_level,
      [QUESTION_SCHEMA.FIELDS.QUIZZES]: question.quizzes,
      [QUESTION_SCHEMA.FIELDS.LANGUAGE_ID]: question.language_id,
      [QUESTION_SCHEMA.FIELDS.IMAGE]: imageName,
      [QUESTION_SCHEMA.FIELDS.QUESTION]: question.question?.trim(),
      [QUESTION_SCHEMA.FIELDS.QUESTION_TYPE]: question.question_type,
      [QUESTION_SCHEMA.FIELDS.OPTION_A]: question.optiona?.trim(),
      [QUESTION_SCHEMA.FIELDS.OPTION_B]: question.optionb?.trim(),
      [QUESTION_SCHEMA.FIELDS.OPTION_C]: optionc?.trim(),
      [QUESTION_SCHEMA.FIELDS.OPTION_D]: optiond?.trim(),
      [QUESTION_SCHEMA.FIELDS.OPTION_E]: optione?.trim(),
      [QUESTION_SCHEMA.FIELDS.ANSWER]: question.answer?.trim(),
      [QUESTION_SCHEMA.FIELDS.LEVEL]: question.level ?? 0,
      [QUESTION_SCHEMA.FIELDS.NOTE]: question.note?.trim() ?? '',
      [QUESTION_SCHEMA.FIELDS.IS_PUBLIC]: question.is_public ?? 1,
    };
  }

  /**
   * Handle image upload for question
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
      throw new Error(`Failed to upload question image:`, { cause: error });
    }
  }

  // Removes main file + thumbs (100x100, 64x64, 50x50)
  private readonly QUESTION_THUMB_SIZES = ['100x100', '64x64', '50x50'];

  private async deleteQuestionImages(imageName: string): Promise<void> {
    if (!imageName) return;
    // main
    await this.fileUploadService.deleteFile(imageName, QUESTION_IMG_PATH);
    // thumbs
    for (const size of this.QUESTION_THUMB_SIZES) {
      await this.fileUploadService.deleteFile(
        `thumbs/${size}/${imageName}`,
        QUESTION_IMG_PATH
      );
    }
  }

  /**
   * Create a new question
   *
   * @param createQuestionDto - Data for creating the question
   * @returns Created question data or error response
   */
  async createQuestion(createQuestionDto: CreateQuestionDto) {
    const result = await this.createQuestionBatch({
      questions: [createQuestionDto],
    });

    if (result.error) {
      return result;
    }

    // Format response for single create
    return {
      error: false,
      message: 'Question created successfully',
      data: transformToString(result.data?.succeeded[0] || null),
    };
  }

  /**
   * Create multiple questions in a batch
   * @param dto BatchCreateQuestionDto containing array of questions
   * @returns Result of batch creation
   */
  async createQuestionBatch(dto: BatchCreateQuestionDto) {
    if (!dto.questions || !Array.isArray(dto.questions)) {
      throw new Error('Invalid questions payload');
    }
    // Validate batch size
    if (dto.questions.length > this.MAX_BATCH_SIZE) {
      return {
        error: true,
        message: `Batch size cannot exceed ${this.MAX_BATCH_SIZE} questions`,
        data: null,
      };
    }

    try {
      // Start transaction
      const trx = await this.dbService.connection.transaction();

      try {
        const succeeded = [];
        const failed = [];
        const questionsToInsert = [];
        const originalQuestions = [];

        // Prepare each question for insertion
        for (const [index, question] of dto.questions.entries()) {
          try {
            const prepared = await this.prepareQuestionData(question);
            questionsToInsert.push(prepared);
            originalQuestions.push(question); // keep original for response
          } catch (error) {
            failed.push({
              index,
              question: question.question,
              error: error,
            });

            this.logger.error(`Failed to prepare question`, {
              question: question.question,
              stack: error,
            });
          }
        }

        // Insert questions in chunks
        for (
          let i = 0;
          i < questionsToInsert.length;
          i += this.MAX_BATCH_SIZE
        ) {
          const chunk = questionsToInsert.slice(i, i + this.MAX_BATCH_SIZE);
          const originalChunk = originalQuestions.slice(
            i,
            i + this.MAX_BATCH_SIZE
          );

          const result = await trx(QUESTION_SCHEMA.TABLE).insert(chunk);
          const firstInsertId = Array.isArray(result) ? result[0] : result;

          for (let j = 0; j < chunk.length; j++) {
            succeeded.push({
              id: firstInsertId + j,
              success: true,
              question: originalChunk[j]?.question ?? '[unknown]',
            });
          }
        }

        // Commit transaction if all succeeded
        if (succeeded.length > 0) {
          await trx.commit();
          // TODO: Cache Manager
          // Will implement in separate cache manager service
        } else {
          await trx.rollback();
        }

        const total = dto.questions.length;

        return {
          error: failed.length > 0,
          message:
            succeeded.length === total
              ? `Successfully created all ${total} questions`
              : succeeded.length === 0
              ? `Failed to create any questions`
              : `Partially created ${succeeded.length} of ${total} questions`,
          data: {
            succeeded,
            failed,
            totalProcessed: total,
          },
        };
      } catch (trxError) {
        await trx.rollback();
        throw trxError;
      }
    } catch (error) {
      this.logger.error('Failed to create question batch', error);
      throw new Error(`Failed to create question batch:`, { cause: error });
    }
  }

  /**
   * Prepare data for updating a question
   * @param dto - EditQuestionDto containing fields to update
   * @param existing - Current question data from the database
   * @returns Prepared payload and old image name if applicable
   */
  private async prepareQuestionUpdateData(
    dto: EditQuestionDto, // extends PartialType(CreateQuestionDto) + optional remove_image
    existing: any // current DB row
  ): Promise<{ payload: any; oldImageToDelete?: string }> {
    const F = QUESTION_SCHEMA.FIELDS;
    const payload: Record<string, any> = {};
    let oldImageToDelete: string | undefined;

    // Utility: set field only if provided (including 0)
    const setIf = (val: any, field: string, transform?: (v: any) => any) => {
      if (val !== undefined) payload[field] = transform ? transform(val) : val;
    };

    // 1) Image: upload new or remove
    const removeImage =
      (dto as any).remove_image === true ||
      (dto as any).remove_image === 1 ||
      (dto as any).remove_image === '1' ||
      (dto as any).remove_image === 'true';

    if (dto.image_file) {
      const newName = await this.handleImageUpload(dto.image_file); // ✅ reuse
      payload[F.IMAGE] = newName;
      if (existing[F.IMAGE]) oldImageToDelete = existing[F.IMAGE];
    } else if (removeImage) {
      payload[F.IMAGE] = '';
      if (existing[F.IMAGE]) oldImageToDelete = existing[F.IMAGE];
    }
    // If no image change is provided, leave the image field untouched.

    // 2) Primitive fields — only set when provided
    setIf(dto.language_id, F.LANGUAGE_ID, Number);
    setIf(dto.category, F.CATEGORY, Number);
    setIf(dto.subcategory, F.SUBCATEGORY, Number);
    setIf(dto.subcategory_level, F.SUBCATEGORY_LEVEL, (v) =>
      v ? Number(v) : null
    );
    setIf(dto.quizzes, F.QUIZZES, Number);

    setIf(dto.question?.trim(), F.QUESTION);
    setIf(dto.question_type, F.QUESTION_TYPE, Number);
    setIf(dto.optiona?.trim(), F.OPTION_A);
    setIf(dto.optionb?.trim(), F.OPTION_B);
    setIf(dto.optionc?.trim(), F.OPTION_C);
    setIf(dto.optiond?.trim(), F.OPTION_D);
    setIf(dto.optione?.trim(), F.OPTION_E);
    setIf(dto.answer?.trim(), F.ANSWER);
    setIf(dto.level, F.LEVEL, Number);
    setIf(dto.note?.trim(), F.NOTE);
    setIf(dto.is_public, F.IS_PUBLIC, Number);

    // 3) Enforce options based on question_type
    const effectiveType =
      dto.question_type !== undefined
        ? Number(dto.question_type)
        : Number(existing[F.QUESTION_TYPE]);

    if (effectiveType !== 1) {
      // For non-multiple-choice types, ensure C/D/E are empty.
      payload[F.OPTION_C] = '';
      payload[F.OPTION_D] = '';
      payload[F.OPTION_E] = '';
    } // If effectiveType === 1, C/D/E are updated only if provided above.

    return { payload, oldImageToDelete };
  }

  /**
   * Edit an existing question by ID
   *
   * @param id - Question ID to edit
   * @param editQuestionDto - Data for editing the question
   * @returns Updated question data or error response
   */
  async editQuestion(id: number, dto: EditQuestionDto) {
    const trx = await this.dbService.connection.transaction();
    let oldImageToDelete: string | undefined;

    try {
      const F = QUESTION_SCHEMA.FIELDS;

      // Load current row
      const existing = await trx(QUESTION_SCHEMA.TABLE).where(F.ID, id).first();

      if (!existing) {
        await trx.rollback();
        return { error: true, message: 'Question not found', data: null };
      }

      // Build partial update (reuses handleImageUpload internally)
      const { payload, oldImageToDelete: toDelete } =
        await this.prepareQuestionUpdateData(dto, existing);

      if (!Object.keys(payload).length) {
        await trx.rollback();
        return {
          error: false,
          message: 'Nothing to update',
          data: transformToString(existing),
        };
      }

      await trx(QUESTION_SCHEMA.TABLE).where(F.ID, id).update(payload);

      const updated = await trx(QUESTION_SCHEMA.TABLE).where(F.ID, id).first();

      await trx.commit();

      // Post-commit: delete old image (if any), outside the transaction
      oldImageToDelete = toDelete;
      if (oldImageToDelete) {
        try {
          await this.deleteQuestionImages(oldImageToDelete); // should remove main + thumbs
        } catch (e: any) {
          this.logger?.warn?.(
            `Failed to delete old question image "${oldImageToDelete}": ${e?.message}`
          );
        }
      }

      // TODO: Cache Manager
      // Will implement in separate cache manager service

      return {
        error: false,
        message: 'Question updated successfully',
        data: transformToString(updated),
      };
    } catch (err: any) {
      await trx.rollback();
      return {
        error: true,
        message: err.message || 'Failed to update question',
        data: null,
      };
    }
  }

  /**
   * [Admin] Get all questions with pagination and search
   * @param offset - Pagination offset
   * @param limit - Number of questions per page
   * @param search - Search term for question title or description
   * @param sortBy - Field to sort by
   * @param order - Sorting direction (ASC/DESC)
   * @returns Paginated list of questions
   * @throws Error if database query fails
   */
  async getAllQuestions(query: {
    offset: number;
    limit: number;
    search?: string;
    sortBy?: QuestionSortBy;
    order?: OrderBy.DESC | OrderBy.ASC;
    languageId?: number;
    categoryId?: number;
    subcategoryId?: number;
    subcategoryLevelId?: number;
    quizId?: number;
  }) {
    const {
      offset = 0,
      limit = 20,
      search,
      sortBy = QuestionSortBy.ID,
      order = OrderBy.DESC,
      languageId,
      categoryId,
      subcategoryId,
      subcategoryLevelId,
      quizId,
    } = query;

    // Add validation
    if (limit < 0 || offset < 0) {
      throw new Error('Limit and offset must be positive numbers');
    }

    const validSortFields = Object.values(QuestionSortBy);
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : QuestionSortBy.ID;

    const db = this.dbService
      .connection(QUESTION_SCHEMA.TABLE + ' as q')
      .leftJoin(`${LANGUAGE_SCHEMA.TABLE} as l`, 'l.id', 'q.language_id')
      .leftJoin(`${CATEGORY_SCHEMA.TABLE} as c`, 'c.id', 'q.category')
      .leftJoin(`${SUBCATEGORY_SCHEMA.TABLE} as s`, 's.id', 'q.subcategory')
      .leftJoin(
        `${SUBCATEGORY_LEVEL_SCHEMA.TABLE} as sl`,
        'sl.id',
        'q.subcategory_level'
      )
      .leftJoin(`${QUIZZ_SCHEMA.TABLE} as quiz`, 'quiz.id', 'q.quizzes')
      .select(
        'q.*',
        'l.language as language',
        'q.category as category_id',
        'c.category_name as category',
        'q.subcategory as subcategory_id',
        's.subcategory_name as subcategory',
        'q.subcategory_level as subcategory_level_id',
        'sl.subcategory_level_name as subcategory_level',
        'q.quizzes as quiz_id',
        'quiz.quizz_name as quiz'
      );

    // Add filter conditions
    if (languageId) {
      db.where('q.language_id', languageId);
    }

    if (categoryId) {
      db.where('q.category', categoryId);
    }

    if (subcategoryId) {
      db.where('q.subcategory', subcategoryId);
    }

    if (subcategoryLevelId) {
      db.where('q.subcategory_level', subcategoryLevelId);
    }

    if (quizId) {
      db.where('q.quizzes', quizId);
    }

    // Search by question name or slug or question or answer
    if (search) {
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&');
      db.where((builder) => {
        builder
          .where(`q.${QUESTION_SCHEMA.FIELDS.QUESTION}`, 'like', `%${sanitizedSearch}%`)
          .orWhere(
            `q.${QUESTION_SCHEMA.FIELDS.OPTION_A}`,
            'like',
            `%${sanitizedSearch}%`
          )
          .orWhere(
            `q.${QUESTION_SCHEMA.FIELDS.OPTION_B}`,
            'like',
            `%${sanitizedSearch}%`
          )
          .orWhere(
            `q.${QUESTION_SCHEMA.FIELDS.OPTION_C}`,
            'like',
            `%${sanitizedSearch}%`
          )
          .orWhere(
            `q.${QUESTION_SCHEMA.FIELDS.OPTION_D}`,
            'like',
            `%${sanitizedSearch}%`
          )
          .orWhere(
            `q.${QUESTION_SCHEMA.FIELDS.OPTION_E}`,
            'like',
            `%${sanitizedSearch}%`
          );
      });
    }

    const totalQuery = db.clone(); // Clone the query for total count

    // Apply sort, limit, offset
    const questions = await db
      .orderBy(sortField, order)
      .limit(limit)
      .offset(offset);

    const results = questions.map((question) => {
      const image = question.image
        ? urlJoin(BASE_URL, QUESTION_IMG_PATH, question.image)
        : null;

      const thumbnail = question.image
        ? urlJoin(BASE_URL, QUESTION_THUMB_PATH_SMALL, question.image)
        : null;

      return {
        ...question,
        image_url: image,
        thumbnail_url: thumbnail,
      };
    });

    const total = await totalQuery.clearSelect().count({ count: '*' }).first();

    return {
      total: Number(total?.count || 0),
      limit,
      offset,
      questions: results,
    };
  }

  /**
   * [Admin] Get detail questions by ID
   *
   * @param id - Question ID to retrieve
   * @returns Detailed question info or error response
   */
  async getQuestionDetail(id: number) {
    if (!isValidId(id)) {
      return {
        error: true,
        message: 'Question ID is required',
        data: null,
      };
    }

    const F = QUESTION_SCHEMA.FIELDS;

    // Fetch question details
    const existing = await this.dbService
      .connection(QUESTION_SCHEMA.TABLE)
      .where(F.ID, id)
      .first();

    if (!existing) {
      return { error: true, message: 'Question not found', data: null };
    }

    const getQuestionDetail = {
      ...existing,
      image_url: existing.image
        ? urlJoin(BASE_URL, QUESTION_IMG_PATH, existing.image)
        : null,
      thumbnail_url: existing.image
        ? urlJoin(BASE_URL, QUESTION_THUMB_PATH_SMALL, existing.image)
        : null,
    };

    return {
      error: false,
      message: 'Question details retrieved successfully',
      data: transformToString(getQuestionDetail),
    };
  }

  /**
   * [Admin] Delete questions by IDs
   *
   * @param dto - DTO containing question IDs to delete
   * @returns Result of deletion operation
   */
  async deleteQuestions(ids: number[]) {
    // normalize & guard
    const uniqueIds = [...new Set(ids.map(Number).filter(Number.isFinite))];
    if (uniqueIds.length === 0) {
      return {
        error: true,
        message: 'No valid question IDs provided',
        data: null,
      };
    }

    const trx = await this.dbService.connection.transaction();
    try {
      const F = QUESTION_SCHEMA.FIELDS;

      // 1) Fetch current rows (to know images & build "missing")
      const rows: Array<{ [k: string]: any }> = await trx(QUESTION_SCHEMA.TABLE)
        .whereIn(F.ID, uniqueIds)
        .select(F.ID, F.IMAGE, F.QUIZZES);

      if (rows.length === 0) {
        await trx.rollback();
        return {
          error: true,
          message: 'Questions not found',
          data: { deleted: [], missing: uniqueIds },
        };
      }

      const foundIds = rows.map((r) => Number(r[F.ID]));
      const foundSet = new Set(foundIds);
      const missing = uniqueIds.filter((id) => !foundSet.has(id));

      // 2) Delete rows
      await trx(QUESTION_SCHEMA.TABLE).whereIn(F.ID, foundIds).del();

      await trx.commit();

      // 3) Post-commit: delete images (main + thumbs). Do not throw if missing on disk
      await Promise.all(
        rows.map(async (r) => {
          const image = r[F.IMAGE] as string | undefined;
          if (!image) return;
          try {
            await this.deleteQuestionImages(image); // should remove /thumbs/100x100, 64x64, 50x50 too
          } catch (e: any) {
            this.logger?.warn?.(
              `Failed to delete question image "${image}" (qId=${r[F.ID]}): ${
                e?.message
              }`
            );
          }
        })
      );

      // TODO: Cache Manager
      // Will implement in separate cache manager service

      return {
        error: false,
        message: `Deleted ${foundIds.length} question(s)`,
        data: { deleted: foundIds, missing },
      };
    } catch (err: unknown) {
      await trx.rollback();
      const message =
        err instanceof Error ? err.message : 'Failed to delete questions';
      return { error: true, message, data: null };
    }
  }

  /**
   * Retrieve a list of quiz questions with full details
   *
   * @param dto - DTO containing question lookup parameters
   * @returns Detailed question info or error response
   */
  async getQuestionsQuizHd(dto: GetQuestionsQuizHdDto) {
    const { category, sub_cat, sub_cat_level, quizzes } = dto;

    const cacheKey = `${CacheKey.UserQuestionList}${JSON.stringify(dto)}`;

    // Try getting from cache first
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      // return cached;
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

    if (dto?.userId) {
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
      is_bookmark: !dto?.userId ? '0' : q.is_bookmark,
    }));

    const response = {
      error: false,
      data: transformToString(processedData),
    };

    await this.redisService.set(cacheKey, response, CACHE_TTL_MIN);

    return response;
  }
}
