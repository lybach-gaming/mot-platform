import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { WebSeoService } from './../web-seo/web-seo.service';
import { FaqService } from '../faq/faq.service';
import { HelpersService } from './../helpers/helpers.service';
import {
  FileUploadService,
  FileUploadOptions,
} from '../../core/file-upload/file-upload.service';
import { CacheKey } from '../../common/constants/cache-key';
import {
  BASE_URL,
  FE_URL,
  QUIZ_HQ_SLUG,
  CATEGORY_IMAGE_PATH,
  CATEGORY_THUMB_PATH,
  CATEGORY_THUMB_PATH_SMALL,
  SUBCATEGORY_IMAGE_PATH,
  SUBCATEGORY_LEVEL_IMAGE_PATH,
  QUIZZES_IMAGE_PATH,
  QUESTION_IMG_PATH,
  FUN_N_LEARN_IMAGE_PATH,
  GUESS_THE_WORD_IMAGE_PATH,
  AUDIO_QUESTION_PATH,
  MATH_MANIA_IMAGE_PATH,
  TypeModeGame,
  QuizMode,
  OrderBy,
  CACHE_TTL_MAX,
} from '../../common/constants/app';
import { CategoryDetailDto } from './dto/category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
import { EditCategoryDto } from './dto/edit-category.dto';
import { CategorySortBy } from '../../common/constants/category';
import { urlJoin } from '../../common/utils/string.util';
import { transformToString } from '../../common/utils/transform.util';
import { isValidId } from '../../common/utils/number.util';
import {
  LANGUAGE_SCHEMA,
  CATEGORY_SCHEMA,
  SUBCATEGORY_SCHEMA,
  SUBCATEGORY_LEVEL_SCHEMA,
  QUIZZ_SCHEMA,
  QUESTION_SCHEMA,
  FAQ_SCHEMA,
  WEB_SEO_SCHEMA,
  GUESS_THE_WORD_SCHEMA,
  FUN_N_LEARN_SCHEMA,
  FUN_N_LEARN_STORY_SCHEMA,
  AUDIO_QUESTION_SCHEMA,
  MATH_QUIZ_SCHEMA,
  MATH_QUESTION_SCHEMA,
} from '../../core/database/schemas';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly fileUploadService: FileUploadService,
    private readonly faqService: FaqService,
    private readonly webSeoService: WebSeoService,
    private readonly helpersService: HelpersService
  ) {}

  /**
   * Handle image upload for category
   * @param file - The uploaded image file
   * @returns The saved image filename
   */
  private async handleImageUpload(file: Express.Multer.File): Promise<string> {
    try {
      const options: FileUploadOptions = {
        directory: CATEGORY_IMAGE_PATH,
        generateThumbnail: true,
        allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
      };

      return await this.fileUploadService.uploadFile(file, options);
    } catch (error) {
      throw new Error(`Failed to upload category image:`, { cause: error });
    }
  }

  /**
   * Build category data object from DTO
   * @param dto - The DTO containing category data
   * @param existingCategory - Optional existing category data for updates
   * @returns Formatted category data object
   */
  private buildCategoryDataFromDto(
    dto: Partial<CreateCategoryDto>,
    existingCategory?: any
  ): any {
    const fields = [
      CATEGORY_SCHEMA.FIELDS.NAME,
      CATEGORY_SCHEMA.FIELDS.LANGUAGE_ID,
      CATEGORY_SCHEMA.FIELDS.TYPE,
      CATEGORY_SCHEMA.FIELDS.SLUG,
      CATEGORY_SCHEMA.FIELDS.IS_PREMIUM,
      CATEGORY_SCHEMA.FIELDS.COINS,
      CATEGORY_SCHEMA.FIELDS.ROW_ORDER,
      CATEGORY_SCHEMA.FIELDS.ENABLE_FAQ,
      CATEGORY_SCHEMA.FIELDS.LEVEL,
      CATEGORY_SCHEMA.FIELDS.IS_COMING_SOON,
    ];

    const categoryData: any = {};

    for (const field of fields) {
      if (dto[field as keyof CreateCategoryDto] !== undefined) {
        categoryData[field] = dto[field as keyof CreateCategoryDto];
      } else if (
        !existingCategory &&
        field === CATEGORY_SCHEMA.FIELDS.IS_PREMIUM
      ) {
        categoryData[field] = 0;
      } else if (!existingCategory && field === CATEGORY_SCHEMA.FIELDS.COINS) {
        categoryData[field] = 0;
      } else if (
        !existingCategory &&
        field === CATEGORY_SCHEMA.FIELDS.ENABLE_FAQ
      ) {
        categoryData[field] = 1;
      } else if (
        !existingCategory &&
        field === CATEGORY_SCHEMA.FIELDS.ROW_ORDER
      ) {
        categoryData[field] = 0;
      } else if (!existingCategory && field === CATEGORY_SCHEMA.FIELDS.LEVEL) {
        categoryData[field] = 0;
      } else if (
        !existingCategory &&
        field === CATEGORY_SCHEMA.FIELDS.IS_COMING_SOON
      ) {
        categoryData[field] = 0;
      }
    }

    return categoryData;
  }

  /**
   * [Admin] Create a new category
   *
   * @param createCategoryDto - Data for creating the category
   * @returns Created category data or error response
   */
  async createCategory(createCategoryDto: CreateCategoryDto) {
    try {
      // Start transaction
      const trx = await this.dbService.connection.transaction();

      try {
        // Generate and format slug
        if (createCategoryDto.slug) {
          try {
            // Validate and format provided slug
            this.helpersService.assertValid(createCategoryDto.slug);

            // Check unique
            const isUnique = await this.helpersService.isUniqueGlobal(
              createCategoryDto.slug
            );
            if (!isUnique) {
              return {
                error: true,
                message: 'Slug already exists',
                data: null,
              };
            }
          } catch (error) {
            await trx.rollback();
            return {
              error: true,
              message:
                error instanceof Error ? error.message : 'Invalid slug format',
              data: null,
            };
          }
        } else if (createCategoryDto.category_name) {
          // If no slug is provided, generate it from category name
          createCategoryDto.slug =
            await this.helpersService.ensureValidAndUnique(
              createCategoryDto.category_name
            );
        }

        // Handle image upload if present
        let imageName = '';
        if (createCategoryDto.image_file) {
          imageName = await this.handleImageUpload(
            createCategoryDto.image_file
          );
        }

        // Extract only the fields that belong to category table
        const categoryData = this.buildCategoryDataFromDto({
          ...createCategoryDto,
        });
        categoryData.image = imageName;

        // Insert the category
        const [insertedId] = await trx(CATEGORY_SCHEMA.TABLE).insert(
          categoryData
        );

        if (!insertedId) {
          await trx.rollback();
          return {
            error: true,
            message: 'Failed to create category',
            data: null,
          };
        }

        // Insert web SEO data
        await this.webSeoService.createWebSeoEntry(
          trx,
          insertedId,
          TypeModeGame.CATEGORY,
          createCategoryDto,
          CATEGORY_SCHEMA.FIELDS.NAME // Use 'category_name' as title field
        );

        // Create FAQ entries if enabled
        await this.faqService.createFaqEntries(
          trx,
          insertedId,
          TypeModeGame.CATEGORY,
          createCategoryDto
        );

        // Fetch the created category before committing
        const createdCategory = await trx(CATEGORY_SCHEMA.TABLE)
          .where(CATEGORY_SCHEMA.FIELDS.ID, insertedId)
          .first();

        // Commit transaction after all operations are done
        await trx.commit();

        // TODO: Cache Manager
        // Will implement in separate cache manager service

        return {
          error: false,
          message: 'Category created successfully',
          data: transformToString(createdCategory),
        };
      } catch (trxError) {
        await trx.rollback();
        throw trxError;
      }
    } catch (error) {
      this.logger.error('Error creating category', error);
      throw new Error('Error creating category', { cause: error });
    }
  }

  /**
   * [Admin] Edit an existing category
   *
   * @param id - ID of the category to edit
   * @param editCategoryDto - Data for editing the category
   * @returns Updated category data or error response
   */
  async editCategory(id: number, dto: EditCategoryDto) {
    const trx = await this.dbService.connection.transaction();
    try {
      const existing = await trx(CATEGORY_SCHEMA.TABLE)
        .where(`${CATEGORY_SCHEMA.FIELDS.ID}`, id)
        .first();
      if (!existing) {
        await trx.rollback();
        return {
          error: true,
          message: 'Category not found',
          data: null,
        };
      }

      // Get web SEO ID
      const webSeo = await trx(WEB_SEO_SCHEMA.TABLE)
        .where(`${WEB_SEO_SCHEMA.FIELDS.MAINCAT_ID}`, id)
        .andWhere(`${WEB_SEO_SCHEMA.FIELDS.SLUG}`, existing.slug)
        .first();

      if (!webSeo) {
        await trx.rollback();
        return {
          error: true,
          message: 'Category SEO data not found',
          data: null,
        };
      }
      const web_seo_id = webSeo.id;

      // Slug
      try {
        if (dto.slug) {
          // Case 1: User update slug
          this.helpersService.assertValid(dto.slug);
          const isUnique = await this.helpersService.isUniqueGlobal(
            dto.slug,
            web_seo_id
          );

          if (!isUnique) {
            await trx.rollback();
            return {
              error: true,
              message: 'Slug already exists',
              data: null,
            };
          }
        } else if (!existing.slug && dto.category_name) {
          // Case 2: No existing slug, generate from category name
          dto.slug = await this.helpersService.ensureValidAndUnique(
            dto.category_name
          );
        } else {
          // Case 3: Keep existing slug
          dto.slug = existing.slug;
        }
      } catch (error) {
        await trx.rollback();
        return {
          error: true,
          message:
            error instanceof Error ? error.message : 'Invalid slug format',
          data: null,
        };
      }

      // Image
      let imageName = existing.image;

      // Check remove_image flag first
      if (dto.remove_image === 1 && existing.image) {
        await this.deleteAllRelatedImages(existing.image, CATEGORY_IMAGE_PATH);
        imageName = '';
      }

      // Check image_file next
      if (dto.image_file) {
        if (existing.image) {
          await this.deleteAllRelatedImages(
            existing.image,
            CATEGORY_IMAGE_PATH
          );
        }
        imageName = await this.handleImageUpload(dto.image_file);
      }

      // Category data
      const categoryData = this.buildCategoryDataFromDto(dto, existing);
      if (imageName !== existing.image) {
        categoryData.image = imageName;
      }

      // Update category
      if (Object.keys(categoryData).length > 0) {
        await trx(CATEGORY_SCHEMA.TABLE)
          .where(`${CATEGORY_SCHEMA.FIELDS.ID}`, id)
          .update(categoryData);
      }

      // Update SEO + FAQ
      await this.webSeoService.updateWebSeoEntry(
        trx,
        id,
        TypeModeGame.CATEGORY,
        dto,
        CATEGORY_SCHEMA.FIELDS.NAME // Use 'category_name' as title field
      );
      if (dto.enable_faq !== undefined) {
        await this.faqService.updateFaqEntries(
          trx,
          id,
          TypeModeGame.CATEGORY,
          dto
        );
      }

      // Update subcategory, subcategory level, quiz and questions of the category if language changed
      if (dto.language_id !== undefined) {
        // Update subcategory related to this category
        await trx(SUBCATEGORY_SCHEMA.TABLE)
          .where(SUBCATEGORY_SCHEMA.FIELDS.MAINCAT_ID, id)
          .update({
            [SUBCATEGORY_LEVEL_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
          });

        // Update subcategory level related to this category
        await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
          .where(SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAINCAT_ID, id)
          .update({
            [SUBCATEGORY_LEVEL_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
          });

        // Update quizzes related to this category
        await trx(QUIZZ_SCHEMA.TABLE)
          .where(QUIZZ_SCHEMA.FIELDS.MAINCAT_ID, id)
          .update({
            [QUIZZ_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
          });

        // Update questions related to this category
        await trx(QUESTION_SCHEMA.TABLE)
          .where(QUESTION_SCHEMA.FIELDS.CATEGORY, id)
          .update({
            [QUESTION_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
          });

        // Update tbl_guess_the_word, tbl_fun_n_learn, tbl_fun_n_learn_story, tbl_audio_question, tbl_math_quizz and tbl_maths_question of the category if language changed
        await trx(GUESS_THE_WORD_SCHEMA.TABLE)
          .where(GUESS_THE_WORD_SCHEMA.FIELDS.CATEGORY, id)
          .update({
            [GUESS_THE_WORD_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
          });

        await trx(FUN_N_LEARN_SCHEMA.TABLE)
          .where(FUN_N_LEARN_SCHEMA.FIELDS.CATEGORY, id)
          .update({
            [FUN_N_LEARN_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
          });

        await trx(FUN_N_LEARN_STORY_SCHEMA.TABLE)
          .where(FUN_N_LEARN_STORY_SCHEMA.FIELDS.CATEGORY, id)
          .update({
            [FUN_N_LEARN_STORY_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
          });

        await trx(AUDIO_QUESTION_SCHEMA.TABLE)
          .where(AUDIO_QUESTION_SCHEMA.FIELDS.CATEGORY, id)
          .update({
            [AUDIO_QUESTION_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
          });

        await trx(MATH_QUIZ_SCHEMA.TABLE)
          .where(MATH_QUIZ_SCHEMA.FIELDS.MAINCAT_ID, id)
          .update({
            [MATH_QUIZ_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
          });

        await trx(MATH_QUESTION_SCHEMA.TABLE)
          .where(MATH_QUESTION_SCHEMA.FIELDS.CATEGORY, id)
          .update({
            [MATH_QUESTION_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
          });
      }

      // Commit transaction
      const updatedCategory = await trx(CATEGORY_SCHEMA.TABLE)
        .where(`${CATEGORY_SCHEMA.FIELDS.ID}`, id)
        .first();
      await trx.commit();

      // TODO: Cache Manager
      // Will implement in separate cache manager service

      return {
        error: false,
        message: 'Category updated successfully',
        data: transformToString(updatedCategory),
      };
    } catch (e) {
      await trx.rollback();
      this.logger.error(`Failed to update Category ID ${id}`, e);
      throw new Error(`Failed to update Category ID ${id}`, { cause: e });
    }
  }

  /**
   * [Admin] Get all categories with pagination and optional search
   * @param query - Query parameters for pagination and search
   * @returns Paginated list of categories
   */
  async getAllCategories(query: {
    limit: number;
    offset: number;
    search?: string;
    sortBy?: CategorySortBy;
    order?: OrderBy.DESC | OrderBy.ASC;
    languageId?: number;
    type?: number;
  }) {
    const {
      limit = 20,
      offset = 0,
      search,
      sortBy = CategorySortBy.ID,
      order = OrderBy.DESC,
      languageId,
      type,
    } = query;

    const filterIds = {
      languageId,
      type,
    };

    const friendlyNames: Record<string, string> = {
      languageId: 'Language ID',
      type: 'Game Type',
    };

    for (const [key, value] of Object.entries(filterIds)) {
      if (value !== undefined && !isValidId(value)) {
        throw new Error(
          `${friendlyNames[key] || key} must be a positive integer`
        );
      }
    }

    // Add validation
    if (limit < 0 || offset < 0) {
      throw new Error('Limit and offset must be non-negative numbers');
    }

    const MAX_LIMIT = 1000;
    if (limit > MAX_LIMIT) {
      throw new Error(`Limit cannot exceed ${MAX_LIMIT}`);
    }

    const validSortFields = Object.values(CategorySortBy);
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : CategorySortBy.ID;

    const db = this.dbService
      .connection(CATEGORY_SCHEMA.TABLE + ' as c')
      .leftJoin(`${LANGUAGE_SCHEMA.TABLE} as l`, 'l.id', 'c.language_id')
      .leftJoin(
        function () {
          // Subquery to count number of questions
          this.select(QUESTION_SCHEMA.FIELDS.CATEGORY)
            .count('* as no_of_que')
            .from(`${QUESTION_SCHEMA.TABLE}`)
            .groupBy(QUESTION_SCHEMA.FIELDS.CATEGORY)
            .as('qq');
        },
        'qq.category',
        'c.id'
      )
      .select(
        'c.*',
        'l.language as language_name',
        this.dbService.connection.raw('IFNULL(qq.no_of_que, 0) as no_of_que')
      );

    // Add filter conditions
    if (languageId) {
      db.where('c.language_id', languageId);
    }

    if (type) {
      db.where('c.type', type); // 1 = Quiz HD, 2 = Fun n Learn, 3 = Guess the Word, 4 = Audio Question, 5 = Math Mania, 6 = True False
    }

    // Search by category name or slug
    if (search) {
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&'); // Escape % and _ for LIKE query
      db.where((builder) => {
        builder
          .where(
            `c.${CATEGORY_SCHEMA.FIELDS.NAME}`,
            'like',
            `%${sanitizedSearch}%`
          )
          .orWhere(
            `c.${CATEGORY_SCHEMA.FIELDS.SLUG}`,
            'like',
            `%${sanitizedSearch}%`
          );
      });
    }

    const totalQuery = db.clone(); // Clone the query for total count

    // Apply sort, limit, offset
    const categories = await db
      .orderBy(sortField, order)
      .limit(limit)
      .offset(offset);

    const results = categories.map((category) => {
      const image = category.image
        ? urlJoin(BASE_URL, CATEGORY_IMAGE_PATH, category.image)
        : null;

      const thumbnail = category.image
        ? urlJoin(BASE_URL, CATEGORY_THUMB_PATH_SMALL, category.image)
        : null;

      const prefixLang = category.language_id === 14 ? '/en' : '/en'; // Default to English for now
      const shareUrl = `${FE_URL}${prefixLang}/${QUIZ_HQ_SLUG}/${category.slug}`;

      return {
        ...category,
        image_url: image,
        thumbnail_url: thumbnail,
        share_url: shareUrl,
      };
    });

    const total = await totalQuery.clearSelect().count({ count: '*' }).first();

    return {
      error: false,
      data: {
        total: Number(total?.count || 0),
        limit,
        offset,
        categories: results,
      },
    };
  }

  /**
   * [Admin] Get detailed information about a category
   * @param id - ID of the category to retrieve
   * @returns Detailed category information or error response
   */
  async getCategoryAdminDetails(id: number) {
    if (!isValidId(id)) {
      return {
        error: true,
        message: 'Category ID is required',
        data: null,
      };
    }
    const trx = await this.dbService.connection.transaction();
    try {
      // Fetch category details
      const category = await trx(CATEGORY_SCHEMA.TABLE)
        .where(`${CATEGORY_SCHEMA.FIELDS.ID}`, id)
        .first();
      if (!category) {
        await trx.rollback();
        return {
          error: true,
          message: 'Category not found',
          data: null,
        };
      }

      // Fetch related web SEO data
      const webSeo = await trx(WEB_SEO_SCHEMA.TABLE)
        .where({
          [WEB_SEO_SCHEMA.FIELDS.MAINCAT_ID]: id,
          [WEB_SEO_SCHEMA.FIELDS.TYPE]: TypeModeGame.CATEGORY,
        })
        .first();
      if (!webSeo) {
        await trx.rollback();
        return {
          error: true,
          message: 'Category SEO data not found',
          data: null,
        };
      }

      // Fetch FAQ entries related to this category
      const faq = await trx(FAQ_SCHEMA.TABLE)
        .where({
          [FAQ_SCHEMA.FIELDS.MAINCAT_ID]: id,
          [FAQ_SCHEMA.FIELDS.TYPE]: TypeModeGame.CATEGORY,
        })
        .select('*');

      // Format image URLs
      const getCategoryDetail = {
        ...category,
        image: category.image
          ? urlJoin(BASE_URL, CATEGORY_IMAGE_PATH, category.image)
          : null,
        thumbnail: category.image
          ? urlJoin(BASE_URL, CATEGORY_THUMB_PATH_SMALL, category.image)
          : null,
        web_seo: webSeo ?? null,
        faq: faq ?? [],
      };

      // Return formatted category details
      await trx.commit();
      return {
        error: false,
        message: 'Category details retrieved successfully',
        data: transformToString(getCategoryDetail),
      };
    } catch (error) {
      await trx.rollback();
      this.logger.error(`Failed to retrieve Category ID ${id}`, error);
      throw new Error(`Failed to retrieve Category ID ${id}`, {
        cause: error,
      });
    }
  }

  /**
   * [Admin] Delete Categories by IDs
   * @param ids - Array of Categories IDs to delete
   * @returns Success or error response
   */
  private readonly THUMB_SIZES = ['100x100', '64x64', '50x50'];

  // One Private function to delete image of all games related to category
  private async deleteAllRelatedImages(imageName?: string, imagePath?: string) {
    if (!imageName || !imagePath) return;
    await this.fileUploadService.deleteFile(imageName, imagePath);
    for (const size of this.THUMB_SIZES) {
      await this.fileUploadService.deleteFile(
        `thumbs/${size}/${imageName}`,
        imagePath
      );
    }
  }

  async deleteCategories(ids: number[]) {
    const trx = await this.dbService.connection.transaction();
    try {
      // Get data to delete
      const categories = await trx(CATEGORY_SCHEMA.TABLE)
        .whereIn(CATEGORY_SCHEMA.FIELDS.ID, ids)
        .select(CATEGORY_SCHEMA.FIELDS.ID, CATEGORY_SCHEMA.FIELDS.IMAGE);

      if (categories.length === 0) {
        await trx.rollback();
        return {
          error: true,
          message: 'Category not found',
          data: { ids },
        };
      }

      const existingIds = new Set(
        categories.map((c) => Number(c[CATEGORY_SCHEMA.FIELDS.ID]))
      );
      const missing = ids.filter((id) => !existingIds.has(Number(id)));

      // Get all subcategory related to these categories
      const subcategories = await trx(SUBCATEGORY_SCHEMA.TABLE)
        .whereIn(SUBCATEGORY_SCHEMA.FIELDS.MAINCAT_ID, [...existingIds])
        .select(
          SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID,
          SUBCATEGORY_LEVEL_SCHEMA.FIELDS.IMAGE,
          SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAINCAT_ID
        );

      // Get all subcategory levels related to these categories
      const subcategoryLevels = await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
        .whereIn(SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAINCAT_ID, [...existingIds])
        .select(
          SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID,
          SUBCATEGORY_LEVEL_SCHEMA.FIELDS.IMAGE,
          SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAINCAT_ID
        );

      // Get all quizzes related to these categories
      const quizzes = await trx(QUIZZ_SCHEMA.TABLE)
        .whereIn(QUIZZ_SCHEMA.FIELDS.MAINCAT_ID, [...existingIds])
        .select(
          QUIZZ_SCHEMA.FIELDS.ID,
          QUIZZ_SCHEMA.FIELDS.IMAGE,
          QUIZZ_SCHEMA.FIELDS.MAINCAT_ID,
          QUIZZ_SCHEMA.FIELDS.IS_FEATURED
        );

      // Get all questions related to these categories
      const questions = await trx(QUESTION_SCHEMA.TABLE)
        .whereIn(QUESTION_SCHEMA.FIELDS.CATEGORY, [...existingIds])
        .select(
          QUESTION_SCHEMA.FIELDS.ID,
          QUESTION_SCHEMA.FIELDS.IMAGE,
          QUESTION_SCHEMA.FIELDS.CATEGORY
        );

      // Get all guess the word related to these categories
      const guessTheWords = await trx(GUESS_THE_WORD_SCHEMA.TABLE)
        .whereIn(GUESS_THE_WORD_SCHEMA.FIELDS.CATEGORY, [...existingIds])
        .select(
          GUESS_THE_WORD_SCHEMA.FIELDS.ID,
          GUESS_THE_WORD_SCHEMA.FIELDS.IMAGE,
          GUESS_THE_WORD_SCHEMA.FIELDS.CATEGORY
        );

      // Get all fun n learn story related to these categories
      const funNLearnStories = await trx(FUN_N_LEARN_STORY_SCHEMA.TABLE)
        .whereIn(FUN_N_LEARN_STORY_SCHEMA.FIELDS.CATEGORY, [...existingIds])
        .select(
          FUN_N_LEARN_STORY_SCHEMA.FIELDS.ID,
          FUN_N_LEARN_STORY_SCHEMA.FIELDS.IMAGE,
          FUN_N_LEARN_STORY_SCHEMA.FIELDS.CATEGORY
        );

      // Get all audio question related to these categories
      const audioQuestions = await trx(AUDIO_QUESTION_SCHEMA.TABLE)
        .whereIn(AUDIO_QUESTION_SCHEMA.FIELDS.CATEGORY, [...existingIds])
        .select(
          AUDIO_QUESTION_SCHEMA.FIELDS.ID,
          AUDIO_QUESTION_SCHEMA.FIELDS.AUDIO,
          AUDIO_QUESTION_SCHEMA.FIELDS.AUDIO_TYPE,
          AUDIO_QUESTION_SCHEMA.FIELDS.CATEGORY
        );

      // Get all math quiz related to these categories
      const mathQuizzes = await trx(MATH_QUIZ_SCHEMA.TABLE)
        .whereIn(MATH_QUIZ_SCHEMA.FIELDS.MAINCAT_ID, [...existingIds])
        .select(
          MATH_QUIZ_SCHEMA.FIELDS.ID,
          MATH_QUIZ_SCHEMA.FIELDS.IMAGE,
          MATH_QUIZ_SCHEMA.FIELDS.MAINCAT_ID
        );

      // Get all math questions related to these categories
      const mathQuestions = await trx(MATH_QUESTION_SCHEMA.TABLE)
        .whereIn(MATH_QUESTION_SCHEMA.FIELDS.CATEGORY, [...existingIds])
        .select(
          MATH_QUESTION_SCHEMA.FIELDS.ID,
          MATH_QUESTION_SCHEMA.FIELDS.IMAGE,
          MATH_QUESTION_SCHEMA.FIELDS.CATEGORY
        );

      // Delete data related to categories
      // Delete questions (rows)
      await trx(QUESTION_SCHEMA.TABLE)
        .whereIn(QUESTION_SCHEMA.FIELDS.CATEGORY, [...existingIds])
        .del();

      // Delete quizzes (rows)
      await trx(QUIZZ_SCHEMA.TABLE)
        .whereIn(QUIZZ_SCHEMA.FIELDS.MAINCAT_ID, [...existingIds])
        .del();

      // Delete subcategory levels (rows)
      await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
        .whereIn(SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAINCAT_ID, [...existingIds])
        .del();

      // Delete subcategories
      await trx(SUBCATEGORY_SCHEMA.TABLE)
        .whereIn(SUBCATEGORY_SCHEMA.FIELDS.MAINCAT_ID, [...existingIds])
        .del();

      // Delete categories
      await trx(CATEGORY_SCHEMA.TABLE)
        .whereIn(CATEGORY_SCHEMA.FIELDS.ID, [...existingIds])
        .del();

      // Delete web_seo (type=[1,2,3,4], quizz_mode ∈ [1,2,3,4,5])
      const quizzModes = [1, 2, 3, 4, 5];
      await this.webSeoService.deleteWebSEOByItem(trx, {
        type: TypeModeGame.CATEGORY,
        itemIds: [...existingIds],
        quizModes: quizzModes,
        childType: [
          TypeModeGame.QUIZ,
          TypeModeGame.SUBCATEGORY_LEVEL,
          TypeModeGame.SUBCATEGORY,
        ], // Also delete SEO of quizzes under these categories
      });

      // Delete faq (type=[1,2,3,4], quizz_mode ∈ [1,2,3,4,5])
      await this.faqService.deleteFaqsByItem(trx, {
        type: TypeModeGame.CATEGORY,
        itemIds: [...existingIds],
        quizModes: quizzModes,
        childType: [
          TypeModeGame.QUIZ,
          TypeModeGame.SUBCATEGORY_LEVEL,
          TypeModeGame.SUBCATEGORY,
        ], // Also delete FAQs of quizzes under these categories
      });

      // TO DO: Detele Fun n Learn data, Audio questions, Maths questions
      await trx(GUESS_THE_WORD_SCHEMA.TABLE)
        .whereIn(GUESS_THE_WORD_SCHEMA.FIELDS.CATEGORY, [...existingIds])
        .del();

      await trx(FUN_N_LEARN_SCHEMA.TABLE)
        .whereIn(FUN_N_LEARN_SCHEMA.FIELDS.CATEGORY, [...existingIds])
        .del();

      await trx(FUN_N_LEARN_STORY_SCHEMA.TABLE)
        .whereIn(FUN_N_LEARN_STORY_SCHEMA.FIELDS.CATEGORY, [...existingIds])
        .del();

      await trx(AUDIO_QUESTION_SCHEMA.TABLE)
        .whereIn(AUDIO_QUESTION_SCHEMA.FIELDS.CATEGORY, [...existingIds])
        .del();

      await trx(MATH_QUIZ_SCHEMA.TABLE)
        .whereIn(MATH_QUIZ_SCHEMA.FIELDS.MAINCAT_ID, [...existingIds])
        .del();

      await trx(MATH_QUESTION_SCHEMA.TABLE)
        .whereIn(MATH_QUESTION_SCHEMA.FIELDS.CATEGORY, [...existingIds])
        .del();

      // Commit transaction
      await trx.commit();

      // After commit, delete images and cache
      await Promise.all(
        questions.map(async (q) => {
          try {
            await this.deleteAllRelatedImages(
              q[QUESTION_SCHEMA.FIELDS.IMAGE],
              QUESTION_IMG_PATH
            );
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
            await this.deleteAllRelatedImages(
              qz[QUIZZ_SCHEMA.FIELDS.IMAGE],
              QUIZZES_IMAGE_PATH
            );
          } catch (e) {
            this.logger?.warn?.(
              `Delete quiz image failed (quizId=${qz.id})`,
              e
            );
          }
        })
      );

      await Promise.all(
        subcategoryLevels.map(async (sl) => {
          try {
            await this.deleteAllRelatedImages(
              sl[SUBCATEGORY_LEVEL_SCHEMA.FIELDS.IMAGE],
              SUBCATEGORY_LEVEL_IMAGE_PATH
            );
          } catch (e) {
            this.logger?.warn?.(
              `Delete subcategory level image failed (slId=${sl.id})`,
              e
            );
          }
        })
      );

      await Promise.all(
        subcategories.map(async (sc) => {
          try {
            await this.deleteAllRelatedImages(
              sc[SUBCATEGORY_SCHEMA.FIELDS.IMAGE],
              SUBCATEGORY_IMAGE_PATH
            );
          } catch (e) {
            this.logger?.warn?.(
              `Delete subcategory image failed (scId=${sc.id})`,
              e
            );
          }
        })
      );

      await Promise.all(
        categories.map(async (c) => {
          try {
            await this.deleteAllRelatedImages(
              c[CATEGORY_SCHEMA.FIELDS.IMAGE],
              CATEGORY_IMAGE_PATH
            );
          } catch (e) {
            this.logger?.warn?.(
              `Delete category image failed (scId=${c.id})`,
              e
            );
          }
        })
      );

      await Promise.all(
        guessTheWords.map(async (gtw) => {
          try {
            await this.deleteAllRelatedImages(
              gtw[GUESS_THE_WORD_SCHEMA.FIELDS.IMAGE],
              GUESS_THE_WORD_IMAGE_PATH
            );
          } catch (e) {
            this.logger?.warn?.(
              `Delete guess the word image failed (gtwId=${gtw.id})`,
              e
            );
          }
        })
      );

      await Promise.all(
        funNLearnStories.map(async (fnl) => {
          try {
            await this.deleteAllRelatedImages(
              fnl[FUN_N_LEARN_STORY_SCHEMA.FIELDS.IMAGE],
              FUN_N_LEARN_IMAGE_PATH
            );
          } catch (e) {
            this.logger?.warn?.(
              `Delete fun n learn story image failed (fnlId=${fnl.id})`,
              e
            );
          }
        })
      );

      await Promise.all(
        audioQuestions.map(async (aq) => {
          try {
            if (aq[AUDIO_QUESTION_SCHEMA.FIELDS.AUDIO_TYPE] === 2) {
              await this.fileUploadService.deleteFile(
                aq[AUDIO_QUESTION_SCHEMA.FIELDS.AUDIO],
                AUDIO_QUESTION_PATH
              );
            }
          } catch (e) {
            this.logger?.warn?.(
              `Delete audio question file failed (aqId=${aq.id})`,
              e
            );
          }
        })
      );

      await Promise.all(
        mathQuizzes.map(async (mq) => {
          try {
            await this.deleteAllRelatedImages(
              mq[MATH_QUIZ_SCHEMA.FIELDS.IMAGE],
              MATH_MANIA_IMAGE_PATH
            );
          } catch (e) {
            this.logger?.warn?.(
              `Delete math quiz image failed (mqId=${mq.id})`,
              e
            );
          }
        })
      );

      await Promise.all(
        mathQuestions.map(async (mqn) => {
          try {
            await this.deleteAllRelatedImages(
              mqn[MATH_QUESTION_SCHEMA.FIELDS.IMAGE],
              MATH_MANIA_IMAGE_PATH
            );
          } catch (e) {
            this.logger?.warn?.(
              `Delete math question image failed (mqnId=${mqn.id})`,
              e
            );
          }
        })
      );

      // TODO: Cache Manager
      // Will implement in separate cache manager service

      return {
        error: false,
        message: `Deleted ${existingIds.size} categories successfully`,
        data: { deleted: [...existingIds], missing },
      };
    } catch (e) {
      await trx.rollback();
      this.logger.error(`Failed to delete categories`, e);
      throw e;
    }
  }

  /**
   * Get category detail with related data
   */
  async getCategoryDetail(params: {
    id?: number;
    slug?: string;
    languageId?: number;
  }): Promise<{
    error: boolean;
    message?: string;
    data: CategoryDetailDto | null;
  }> {
    try {
      // Validate required params
      if (!params.slug && !params.id) {
        return {
          error: true,
          message: 'Either id or slug is required',
          data: null,
        };
      }

      // Generate cache key based on available parameter
      const cacheKey = params.id
        ? `${CacheKey.UserCategoryDetail}language:${params.languageId}:id:${params.id}`
        : `${CacheKey.UserCategoryDetail}language:${params.languageId}:slug:${params.slug}`;

      // Try getting from cache first
      const cached = await this.redisService.get<CategoryDetailDto>(cacheKey);

      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return { error: false, data: cached };
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
        return { error: true, message: 'Category not found', data: null };
      }

      // Get FAQ details
      const faq = await this.dbService.connection
        .table(FAQ_SCHEMA.TABLE)
        .where({
          type: TypeModeGame.CATEGORY,
          maincat_id: data.id,
          quizz_mode: QuizMode.QUIZ_HQ,
        });

      // Parse web_seo JSON string to object
      data.web_seo = JSON.parse(data.web_seo);

      // Transform data to match DTO and response data of PHP API
      const result: CategoryDetailDto = transformToString({
        ...data,
        image: data.image
          ? urlJoin(BASE_URL, CATEGORY_IMAGE_PATH, data.image)
          : '',
        thumb_image: data.image
          ? urlJoin(BASE_URL, CATEGORY_THUMB_PATH, data.image)
          : '',
        no_of: data.no_of?.toString() || '0',
        no_of_que: data.no_of_que?.toString() || '0',
        maxlevel: data.no_of === 0 ? data.maxlevel?.toString() || '0' : '0',
        faq: faq,
        share_url: this.generateShareUrl(data.slug, params.languageId),
      });

      // Cache the result
      await this.redisService.set(cacheKey, result, CACHE_TTL_MAX);

      // Cache with alternate key
      const altKey = params.id
        ? `${CacheKey.UserCategoryDetail}language:${params.languageId}:slug:${data.slug}`
        : `${CacheKey.UserCategoryDetail}language:${params.languageId}:id:${data.id}`;
      await this.redisService.set(altKey, result, CACHE_TTL_MAX);

      this.logger.debug(`Cached category data for ${cacheKey} and ${altKey}`);

      return { error: false, data: result };
    } catch (error) {
      this.logger.error('Failed to get category detail', error);
      return {
        error: true,
        message: 'Failed to get category detail',
        data: null,
      };
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
