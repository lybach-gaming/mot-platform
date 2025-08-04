import { CreateQuestionDto } from './dto/create-question.dto';
import { Injectable, Logger } from '@nestjs/common';
import { GetQuestionsQuizHdDto } from './dto/get-questions-quiz-hd.dto';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { transformToString } from '../../common/utils/transform.util';
import { encryptData, urlJoin } from '../../common/utils/string.util';
import {
  BASE_URL,
  CACHE_TTL_DEFAULT,
  QUESTION_IMG_PATH,
  SECRET_KEY_ANSWER,
} from '../../common/constants/app';
import { BOOKMARK_SCHEMA, QUESTION_SCHEMA } from '../../core/database/schemas';
import { CacheKey } from '../../common/constants/cache-key';
import {
  FileUploadService,
  FileUploadOptions,
} from '../../core/file-upload/file-upload.service';
import { BatchCreateQuestionDto } from './dto/batch-create-question.dto';

@Injectable()
export class QuestionService {
  private readonly logger = new Logger(QuestionService.name);
  private readonly MAX_BATCH_SIZE = 100; // Giới hạn số lượng questions/batch

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
      throw new Error(`Failed to upload question image: ${error.message}`);
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

    // Format lại response cho single create để giữ backward compatibility
    return {
      error: false,
      message: 'Question created successfully',
      data: transformToString(result.data.succeeded[0]),
    };
  }

  /**
   * Create multiple questions in a batch
   * @param dto BatchCreateQuestionDto containing array of questions
   * @returns Result of batch creation
   */
  async createQuestionBatch(dto: BatchCreateQuestionDto) {
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
        const batchResults = [];
        const errors = [];
        const questionsToInsert = [];

        // First, prepare all questions data
        for (const [index, question] of dto.questions.entries()) {
          try {
            const questionData = await this.prepareQuestionData(question);
            questionsToInsert.push(questionData);
          } catch (questionError) {
            errors.push({
              index,
              question: question.question,
              error: questionError.message,
            });
            this.logger.error(
              `Failed to prepare question: ${questionError.message}`,
              {
                question: question.question,
                stack: questionError.stack,
              }
            );
          }
        }

        // Then do a batch insert for all prepared questions
        if (questionsToInsert.length > 0) {
          // Use chunking if number of questions is large
          const chunkSize = 100; // Adjust based on your DB performance
          const chunks = [];

          for (let i = 0; i < questionsToInsert.length; i += chunkSize) {
            const chunk = questionsToInsert.slice(i, i + chunkSize);
            chunks.push(chunk);
          }

          // Process chunks sequentially within the same transaction
          for (const chunk of chunks) {
            const insertedIds = await trx(QUESTION_SCHEMA.TABLE)
              .insert(chunk)
              .returning(QUESTION_SCHEMA.FIELDS.ID);

            // Map results maintaining original question order
            batchResults.push(
              ...insertedIds.map((id, idx) => ({
                id,
                success: true,
                question: dto.questions[batchResults.length + idx].question,
              }))
            );
          }
        }

        if (batchResults.length > 0) {
          await trx.commit();
          await this.redisService.del(CacheKey.GetQuestionsQuizHd);

          return {
            error: false,
            message: `Successfully created ${batchResults.length} questions${
              errors.length > 0 ? ` with ${errors.length} errors` : ''
            }`,
            data: {
              succeeded: batchResults,
              failed: errors,
              totalProcessed: dto.questions.length,
            },
          };
        } else {
          await trx.rollback();
          return {
            error: true,
            message: 'Failed to create any questions in batch',
            data: { errors },
          };
        }
      } catch (trxError) {
        await trx.rollback();
        throw trxError;
      }
    } catch (error) {
      return {
        error: true,
        message: error.message || 'Failed to process question batch',
        data: null,
      };
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

    const cacheKey = `${CacheKey.GetQuestionsQuizHd}${JSON.stringify(dto)}`;

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

    await this.redisService.set(cacheKey, response, CACHE_TTL_DEFAULT);

    return response;
  }
}
