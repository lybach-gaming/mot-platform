import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { WebSeoService } from '../web-seo/web-seo.service';
import { FaqService } from '../faq/faq.service';
import { HelpersService } from '../helpers/helpers.service';
import {
  FileUploadService,
  FileUploadOptions,
} from '../../core/file-upload/file-upload.service';
import { CacheKey } from '../../common/constants/cache-key';
import {
  BASE_URL,
  FE_URL,
  QUIZ_HQ_SLUG,
  SUBCATEGORY_IMAGE_PATH,
  SUBCATEGORY_THUMB_PATH,
  SUBCATEGORY_THUMB_PATH_SMALL,
  SUBCATEGORY_LEVEL_IMAGE_PATH,
  QUIZZES_IMAGE_PATH,
  QUESTION_IMG_PATH,
  FUN_N_LEARN_IMAGE_PATH,
  GUESS_THE_WORD_IMAGE_PATH,
  AUDIO_QUESTION_PATH,
  MAX_LIMIT,
  OrderBy,
  QuizMode,
  TypeModeGame,
  CACHE_TTL_MAX,
} from '../../common/constants/app';
import { SubcategoryDetailDto } from './dto/subcategory.dto';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { EditSubcategoryDto } from './dto/edit-subcategory.dto';
import { SubcategorySortBy } from '../../common/constants/subcategory';
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
} from '../../core/database/schemas';

@Injectable()
export class SubcategoryService {
  private readonly logger = new Logger(SubcategoryService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly fileUploadService: FileUploadService,
    private readonly faqService: FaqService,
    private readonly webSeoService: WebSeoService,
    private readonly helpersService: HelpersService
  ) {}

  /**
   * Handle image upload for subcategory
   * @param file - The uploaded image file
   * @returns The saved image filename
   */
  private async handleImageUpload(file: Express.Multer.File): Promise<string> {
    try {
      const options: FileUploadOptions = {
        directory: SUBCATEGORY_IMAGE_PATH,
        generateThumbnail: true,
        allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
      };

      return await this.fileUploadService.uploadFile(file, options);
    } catch (error) {
      throw new Error(`Failed to upload subcategory image:`, { cause: error });
    }
  }

  /**
   * Build subcategory data object from DTO
   * @param dto - The DTO containing subcategory data
   * @param existingSubcategory - Optional existing subcategory data for updates
   * @returns Formatted subcategory data object
   */
  private buildSubcategoryDataFromDto(
    dto: Partial<CreateSubcategoryDto>,
    existingSubcategory?: any
  ): any {
    const fields = [
      SUBCATEGORY_SCHEMA.FIELDS.NAME,
      SUBCATEGORY_SCHEMA.FIELDS.LANGUAGE_ID,
      SUBCATEGORY_SCHEMA.FIELDS.MAINCAT_ID,
      SUBCATEGORY_SCHEMA.FIELDS.SLUG,
      SUBCATEGORY_SCHEMA.FIELDS.STATUS,
      SUBCATEGORY_SCHEMA.FIELDS.IS_PREMIUM,
      SUBCATEGORY_SCHEMA.FIELDS.COINS,
      SUBCATEGORY_SCHEMA.FIELDS.ROW_ORDER,
      SUBCATEGORY_SCHEMA.FIELDS.ENABLE_FAQ,
      SUBCATEGORY_SCHEMA.FIELDS.LEVEL,
      SUBCATEGORY_SCHEMA.FIELDS.IS_COMING_SOON,
    ];

    const subcategoryData: any = {};

    for (const field of fields) {
      if (dto[field as keyof CreateSubcategoryDto] !== undefined) {
        subcategoryData[field] = dto[field as keyof CreateSubcategoryDto];
      } else if (
        !existingSubcategory &&
        field === SUBCATEGORY_SCHEMA.FIELDS.STATUS
      ) {
        subcategoryData[field] = 1;
      } else if (
        !existingSubcategory &&
        field === SUBCATEGORY_SCHEMA.FIELDS.IS_PREMIUM
      ) {
        subcategoryData[field] = 0;
      } else if (
        !existingSubcategory &&
        field === SUBCATEGORY_SCHEMA.FIELDS.COINS
      ) {
        subcategoryData[field] = 0;
      } else if (
        !existingSubcategory &&
        field === SUBCATEGORY_SCHEMA.FIELDS.ENABLE_FAQ
      ) {
        subcategoryData[field] = 1;
      } else if (
        !existingSubcategory &&
        field === SUBCATEGORY_SCHEMA.FIELDS.ROW_ORDER
      ) {
        subcategoryData[field] = 0;
      } else if (
        !existingSubcategory &&
        field === SUBCATEGORY_SCHEMA.FIELDS.LEVEL
      ) {
        subcategoryData[field] = 0;
      } else if (
        !existingSubcategory &&
        field === SUBCATEGORY_SCHEMA.FIELDS.IS_COMING_SOON
      ) {
        subcategoryData[field] = 0;
      }
    }

    return subcategoryData;
  }

  /**
   * [Admin] Create a new subcategory
   *
   * @param createSubcategoryDto - Data for creating the subcategory
   * @returns Created subcategory data or error response
   */
  async createSubcategory(createSubcategoryDto: CreateSubcategoryDto) {
    try {
      // Start transaction
      const trx = await this.dbService.connection.transaction();

      try {
        // Generate and format slug
        if (createSubcategoryDto.slug) {
          try {
            // Validate and format provided slug
            this.helpersService.assertValid(createSubcategoryDto.slug);

            // Check unique
            const isUnique = await this.helpersService.isUniqueGlobal(
              createSubcategoryDto.slug
            );
            if (!isUnique) {
              await trx.rollback();
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
        } else if (createSubcategoryDto.subcategory_name) {
          // If no slug is provided, generate it from subcategory name
          createSubcategoryDto.slug =
            await this.helpersService.ensureValidAndUnique(
              createSubcategoryDto.subcategory_name
            );
        }

        // Handle image upload if present
        let pendingImageUpload: Express.Multer.File | null = null;
        let imageName = '';
        if (createSubcategoryDto.image_file) {
          pendingImageUpload = createSubcategoryDto.image_file;
        }

        // Extract only the fields that belong to subcategory table
        const subcategoryData = this.buildSubcategoryDataFromDto({
          ...createSubcategoryDto,
        });
        subcategoryData.image = imageName;

        // Insert the subcategory
        const [insertedId] = await trx(SUBCATEGORY_SCHEMA.TABLE).insert(
          subcategoryData
        );

        if (!insertedId) {
          await trx.rollback();
          return {
            error: true,
            message: 'Failed to create subcategory',
            data: null,
          };
        }

        // Insert web SEO data
        await this.webSeoService.createWebSeoEntry(
          trx,
          insertedId,
          TypeModeGame.SUBCATEGORY,
          createSubcategoryDto,
          SUBCATEGORY_SCHEMA.FIELDS.NAME // Use 'subcategory_name' as title field
        );

        // Create FAQ entries if enabled
        await this.faqService.createFaqEntries(
          trx,
          insertedId,
          TypeModeGame.SUBCATEGORY,
          createSubcategoryDto
        );

        // Fetch the created subcategory before committing
        const createdSubcategory = await trx(SUBCATEGORY_SCHEMA.TABLE)
          .where(SUBCATEGORY_SCHEMA.FIELDS.ID, insertedId)
          .first();

        // Commit transaction after all operations are done
        await trx.commit();

        // After commit, handle image upload
        if (pendingImageUpload) {
          try {
            imageName = await this.handleImageUpload(pendingImageUpload);
            // Update subcategory with new image name
            await this.dbService
              .connection(SUBCATEGORY_SCHEMA.TABLE)
              .where(SUBCATEGORY_SCHEMA.FIELDS.ID, insertedId)
              .update({ image: imageName });
          } catch (imageError) {
            this.logger.error(
              `Image upload failed for Subcategory ID ${insertedId}`,
              imageError
            );
          }
        }

        // TODO: Cache Manager
        // Will implement in separate cache manager service

        return {
          error: false,
          message: 'Subcategory created successfully',
          data: transformToString(createdSubcategory),
        };
      } catch (trxError) {
        await trx.rollback();
        throw trxError;
      }
    } catch (error) {
      this.logger.error('Error creating subcategory', error);
      throw new Error('Error creating subcategory', { cause: error });
    }
  }

  /**
   * [Admin] Edit an existing subcategory
   *
   * @param id - ID of the subcategory to edit
   * @param editSubcategoryDto - Data for editing the subcategory
   * @returns Updated subcategory data or error response
   */
  async editSubcategory(id: number, dto: EditSubcategoryDto) {
    const trx = await this.dbService.connection.transaction();
    try {
      const existing = await trx(SUBCATEGORY_SCHEMA.TABLE)
        .where(`${SUBCATEGORY_SCHEMA.FIELDS.ID}`, id)
        .first();
      if (!existing) {
        await trx.rollback();
        return {
          error: true,
          message: 'Subcategory not found',
          data: null,
        };
      }

      // Get web SEO ID
      const webSeo = await trx(WEB_SEO_SCHEMA.TABLE)
        .where(WEB_SEO_SCHEMA.FIELDS.SUBCATEGORY_ID, id)
        .andWhere(WEB_SEO_SCHEMA.FIELDS.TYPE, TypeModeGame.SUBCATEGORY)
        .first();

      if (!webSeo) {
        await trx.rollback();
        return {
          error: true,
          message: 'Subcategory SEO data not found',
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
            web_seo_id,
            {
              table: WEB_SEO_SCHEMA.TABLE,
              idField: WEB_SEO_SCHEMA.FIELDS.ID,
              slugField: WEB_SEO_SCHEMA.FIELDS.SLUG,
            }
          );

          if (!isUnique) {
            await trx.rollback();
            return {
              error: true,
              message: 'Slug already exists',
              data: null,
            };
          }
        } else if (!existing.slug && dto.subcategory_name) {
          // Case 2: No existing slug, generate from subcategory name
          dto.slug = await this.helpersService.ensureValidAndUnique(
            dto.subcategory_name
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
      let pendingImageDelete: string | null = null;
      let pendingImageUpload: Express.Multer.File | null = null;

      // Validate mutually exclusive flags
      if (dto.remove_image === 1 && dto.image_file) {
        await trx.rollback();
        return {
          error: true,
          message: 'Cannot upload and remove image at the same time',
          data: null,
        };
      }

      // Check remove_image flag first
      if (dto.remove_image === 1 && existing.image) {
        pendingImageDelete = existing.image;
        imageName = '';
      }

      // Check image_file next
      if (dto.image_file) {
        if (existing.image) {
          pendingImageDelete = existing.image;
        }
        pendingImageUpload = dto.image_file;
      }

      // Subcategory data
      const subcategoryData = this.buildSubcategoryDataFromDto(dto, existing);
      if (imageName !== existing.image) {
        subcategoryData.image = imageName;
      }

      // Update subcategory
      if (Object.keys(subcategoryData).length > 0) {
        await trx(SUBCATEGORY_SCHEMA.TABLE)
          .where(`${SUBCATEGORY_SCHEMA.FIELDS.ID}`, id)
          .update(subcategoryData);
      }

      // Update SEO + FAQ
      await this.webSeoService.updateWebSeoEntry(
        trx,
        id,
        TypeModeGame.SUBCATEGORY,
        dto,
        SUBCATEGORY_SCHEMA.FIELDS.NAME // Use 'subcategory_name' as title field
      );
      if (dto.enable_faq !== undefined) {
        await this.faqService.updateFaqEntries(
          trx,
          id,
          TypeModeGame.SUBCATEGORY,
          dto
        );
      }

      // Update subcategory level, quiz and questions of the subcategory if language or category changed
      if (dto.language_id !== undefined || dto.maincat_id !== undefined) {
        // Update subcategory level related to this subcategory
        await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
          .where(SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAIN_SUBCAT_ID, id)
          .update({
            [SUBCATEGORY_LEVEL_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
            [SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAINCAT_ID]: dto.maincat_id
              ? dto.maincat_id
              : existing.maincat_id,
          });

        // Update quizzes related to this subcategory
        await trx(QUIZZ_SCHEMA.TABLE)
          .where(QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_ID, id)
          .update({
            [QUIZZ_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
            [QUIZZ_SCHEMA.FIELDS.MAINCAT_ID]: dto.maincat_id
              ? dto.maincat_id
              : existing.maincat_id,
          });

        // Update questions related to this subcategory
        await trx(QUESTION_SCHEMA.TABLE)
          .where(QUESTION_SCHEMA.FIELDS.SUBCATEGORY, id)
          .update({
            [QUESTION_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
            [QUESTION_SCHEMA.FIELDS.CATEGORY]: dto.maincat_id
              ? dto.maincat_id
              : existing.maincat_id,
          });

        // Update tbl_guess_the_word, tbl_fun_n_learn, tbl_fun_n_learn_story, tbl_audio_question, tbl_math_quizz and tbl_maths_question of the category if language changed
        await trx(GUESS_THE_WORD_SCHEMA.TABLE)
          .where(GUESS_THE_WORD_SCHEMA.FIELDS.SUBCATEGORY, id)
          .update({
            [GUESS_THE_WORD_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
            [GUESS_THE_WORD_SCHEMA.FIELDS.CATEGORY]: dto.maincat_id
              ? dto.maincat_id
              : existing.maincat_id,
          });

        await trx(FUN_N_LEARN_SCHEMA.TABLE)
          .where(FUN_N_LEARN_SCHEMA.FIELDS.SUBCATEGORY, id)
          .update({
            [FUN_N_LEARN_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
            [FUN_N_LEARN_SCHEMA.FIELDS.CATEGORY]: dto.maincat_id
              ? dto.maincat_id
              : existing.maincat_id,
          });

        await trx(FUN_N_LEARN_STORY_SCHEMA.TABLE)
          .where(FUN_N_LEARN_STORY_SCHEMA.FIELDS.SUBCATEGORY, id)
          .update({
            [FUN_N_LEARN_STORY_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
            [FUN_N_LEARN_STORY_SCHEMA.FIELDS.CATEGORY]: dto.maincat_id
              ? dto.maincat_id
              : existing.maincat_id,
          });

        await trx(AUDIO_QUESTION_SCHEMA.TABLE)
          .where(AUDIO_QUESTION_SCHEMA.FIELDS.SUBCATEGORY, id)
          .update({
            [AUDIO_QUESTION_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
            [AUDIO_QUESTION_SCHEMA.FIELDS.CATEGORY]: dto.maincat_id
              ? dto.maincat_id
              : existing.maincat_id,
          });
      }

      const updatedSubcategory = await trx(SUBCATEGORY_SCHEMA.TABLE)
        .where(`${SUBCATEGORY_SCHEMA.FIELDS.ID}`, id)
        .first();
      await trx.commit();

      // After commit, handle image upload/delete
      try {
        if (pendingImageDelete) {
          await this.deleteAllRelatedImages(
            pendingImageDelete,
            SUBCATEGORY_IMAGE_PATH
          );
        }
      } catch (imageError) {
        this.logger.error(
          `Image deletion failed for Subcategory ID ${id}`,
          imageError
        );
      }

      try {
        if (pendingImageUpload) {
          imageName = await this.handleImageUpload(pendingImageUpload);
          // Update subcategory with new image name
          await this.dbService
            .connection(SUBCATEGORY_SCHEMA.TABLE)
            .where(SUBCATEGORY_SCHEMA.FIELDS.ID, id)
            .update({ image: imageName });
        }
      } catch (imageError) {
        this.logger.error(
          `Image upload failed for Subcategory ID ${id}`,
          imageError
        );
      }

      // TODO: Cache Manager
      // Will implement in separate cache manager service

      return {
        error: false,
        message: 'Subcategory updated successfully',
        data: transformToString(updatedSubcategory),
      };
    } catch (e) {
      await trx.rollback();
      this.logger.error(`Failed to update Subcategory ID ${id}`, e);
      throw new Error(`Failed to update Subcategory ID ${id}`, { cause: e });
    }
  }

  /**
   * [Admin] Get all subcategories with pagination and optional search
   * @param query - Query parameters for pagination and search
   * @returns Paginated list of subcategories
   */
  async getAllSubcategories(query: {
    limit: number;
    offset: number;
    search?: string;
    sortBy?: SubcategorySortBy;
    order?: OrderBy.DESC | OrderBy.ASC;
    languageId?: number;
    categoryId?: number;
  }) {
    const {
      limit = 20,
      offset = 0,
      search,
      sortBy = SubcategorySortBy.ID,
      order = OrderBy.DESC,
      languageId,
      categoryId,
    } = query;

    const filterIds = {
      languageId,
      categoryId,
    };

    const friendlyNames: Record<string, string> = {
      languageId: 'Language ID',
      categoryId: 'Category ID',
    };

    for (const [key, value] of Object.entries(filterIds)) {
      if (value !== undefined && !isValidId(value)) {
        throw new BadRequestException(
          `${friendlyNames[key] || key} must be a positive integer`
        );
      }
    }

    // Add validation
    if (
      !Number.isInteger(limit) ||
      !Number.isInteger(offset) ||
      limit < 0 ||
      offset < 0
    ) {
      throw new BadRequestException(
        'Limit and offset must be non-negative numbers'
      );
    }

    if (limit > MAX_LIMIT) {
      throw new BadRequestException(`Limit cannot exceed ${MAX_LIMIT}`);
    }

    const validSortFields = Object.values(SubcategorySortBy);
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : SubcategorySortBy.ID;

    const db = this.dbService
      .connection(SUBCATEGORY_SCHEMA.TABLE + ' as s')
      .leftJoin(`${LANGUAGE_SCHEMA.TABLE} as l`, 'l.id', 's.language_id')
      .leftJoin(`${CATEGORY_SCHEMA.TABLE} as c`, 'c.id', 's.maincat_id')
      .leftJoin(
        function () {
          // Subquery to count number of questions
          this.select(QUESTION_SCHEMA.FIELDS.SUBCATEGORY)
            .count('* as no_of_que')
            .from(`${QUESTION_SCHEMA.TABLE}`)
            .groupBy(QUESTION_SCHEMA.FIELDS.SUBCATEGORY)
            .as('qq');
        },
        'qq.subcategory',
        's.id'
      )
      .select(
        's.*',
        'l.language as language_name',
        'c.category_name',
        'c.slug as category_slug',
        this.dbService.connection.raw('IFNULL(qq.no_of_que, 0) as no_of_que')
      );

    // Add filter conditions
    if (languageId) {
      db.where('s.language_id', languageId);
    }

    if (categoryId) {
      db.where('s.maincat_id', categoryId);
    }

    // Search by subcategory name or slug
    if (search) {
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&');
      db.where((builder) => {
        builder
          .where(
            `s.${SUBCATEGORY_SCHEMA.FIELDS.NAME}`,
            'like',
            `%${sanitizedSearch}%`
          )
          .orWhere(
            `s.${SUBCATEGORY_SCHEMA.FIELDS.SLUG}`,
            'like',
            `%${sanitizedSearch}%`
          );
      });
    }

    const totalQuery = db.clone(); // Clone the query for total count

    // Apply sort, limit, offset
    const subcategories = await db
      .orderBy(sortField, order)
      .limit(limit)
      .offset(offset);

    const results = subcategories.map((subcategory) => {
      const image = subcategory.image
        ? urlJoin(BASE_URL, SUBCATEGORY_IMAGE_PATH, subcategory.image)
        : null;

      const thumbnail = subcategory.image
        ? urlJoin(BASE_URL, SUBCATEGORY_THUMB_PATH_SMALL, subcategory.image)
        : null;

      const prefixLang = subcategory.language_id === 14 ? '/en' : '/en'; // Default to English for now
      const shareUrl = `${FE_URL}${prefixLang}/${QUIZ_HQ_SLUG}/${subcategory.category_slug}/${subcategory.slug}`;

      return {
        ...subcategory,
        image_url: image,
        thumbnail_url: thumbnail,
        share_url: shareUrl,
      };
    });

    const total = await totalQuery.clearSelect().count({ count: '*' }).first();

    return {
      error: false,
      message: 'Subcategories retrieved successfully',
      data: {
        total: Number(total?.count || 0),
        limit,
        offset,
        subcategories: results,
      },
    };
  }

  /**
   * [Admin] Get detailed information about a subcategory
   * @param id - ID of the subcategory to retrieve
   * @returns Detailed subcategory information or error response
   */
  async getSubcategoryAdminDetails(id: number) {
    if (!isValidId(id)) {
      return {
        error: true,
        message: 'Subcategory ID is required',
        data: null,
      };
    }
    const trx = await this.dbService.connection.transaction();
    try {
      // Fetch subcategory details
      const subcategory = await trx(SUBCATEGORY_SCHEMA.TABLE)
        .where(`${SUBCATEGORY_SCHEMA.FIELDS.ID}`, id)
        .first();
      if (!subcategory) {
        await trx.rollback();
        return {
          error: true,
          message: 'Subcategory not found',
          data: null,
        };
      }

      // Fetch related web SEO data
      const webSeo = await trx(WEB_SEO_SCHEMA.TABLE)
        .where({
          [WEB_SEO_SCHEMA.FIELDS.SUBCATEGORY_ID]: id,
          [WEB_SEO_SCHEMA.FIELDS.TYPE]: TypeModeGame.SUBCATEGORY,
        })
        .first();
      if (!webSeo) {
        await trx.rollback();
        return {
          error: true,
          message: 'Subcategory SEO data not found',
          data: null,
        };
      }

      // Fetch FAQ entries related to this subcategory
      const faq = await trx(FAQ_SCHEMA.TABLE)
        .where({
          [FAQ_SCHEMA.FIELDS.SUBCATEGORY_ID]: id,
          [FAQ_SCHEMA.FIELDS.TYPE]: TypeModeGame.SUBCATEGORY,
        })
        .select('*');

      // Format image URLs
      const getSubcategoryDetail = {
        ...subcategory,
        image_url: subcategory.image
          ? urlJoin(BASE_URL, SUBCATEGORY_IMAGE_PATH, subcategory.image)
          : null,
        thumbnail_url: subcategory.image
          ? urlJoin(BASE_URL, SUBCATEGORY_THUMB_PATH_SMALL, subcategory.image)
          : null,
        web_seo: webSeo ?? null,
        faq: faq ?? [],
      };

      // Return formatted subcategory data
      await trx.commit();
      return {
        error: false,
        message: 'Subcategory details retrieved successfully',
        data: transformToString(getSubcategoryDetail),
      };
    } catch (error) {
      await trx.rollback();
      this.logger.error(`Failed to retrieve Subcategory ID ${id}`, error);
      throw new Error(`Failed to retrieve Subcategory ID ${id}`, {
        cause: error,
      });
    }
  }

  /**
   * [Admin] Delete Subcategories by IDs
   * @param ids - Array of Subcategories IDs to delete
   * @returns Success or error response
   */
  private readonly THUMB_SIZES = ['100x100', '64x64', '50x50'];

  // One Private function to delete image of all games related to subcategory
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

  async deleteSubcategories(ids: number[]) {
    const trx = await this.dbService.connection.transaction();
    try {
      // Get data to delete
      const subcategories = await trx(SUBCATEGORY_SCHEMA.TABLE)
        .whereIn(SUBCATEGORY_SCHEMA.FIELDS.ID, ids)
        .select(SUBCATEGORY_SCHEMA.FIELDS.ID, SUBCATEGORY_SCHEMA.FIELDS.IMAGE);

      if (subcategories.length === 0) {
        await trx.rollback();
        return {
          error: true,
          message: 'Subcategory not found',
          data: { ids },
        };
      }

      const existingIds = new Set(
        subcategories.map((q) => Number(q[SUBCATEGORY_SCHEMA.FIELDS.ID]))
      );
      const missing = ids.filter((id) => !existingIds.has(Number(id)));

      // Get all subcategory levels related to these subcategories
      const subcategoryLevels = await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
        .whereIn(SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAIN_SUBCAT_ID, [
          ...existingIds,
        ])
        .select(
          SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID,
          SUBCATEGORY_LEVEL_SCHEMA.FIELDS.IMAGE,
          SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAIN_SUBCAT_ID
        );

      // Get all quizzes related to these subcategories
      const quizzes = await trx(QUIZZ_SCHEMA.TABLE)
        .whereIn(QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_ID, [...existingIds])
        .select(
          QUIZZ_SCHEMA.FIELDS.ID,
          QUIZZ_SCHEMA.FIELDS.IMAGE,
          QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_ID,
          QUIZZ_SCHEMA.FIELDS.IS_FEATURED
        );

      // Get all questions related to these subcategories
      const questions = await trx(QUESTION_SCHEMA.TABLE)
        .whereIn(QUESTION_SCHEMA.FIELDS.SUBCATEGORY, [...existingIds])
        .select(
          QUESTION_SCHEMA.FIELDS.ID,
          QUESTION_SCHEMA.FIELDS.IMAGE,
          QUESTION_SCHEMA.FIELDS.SUBCATEGORY
        );

      // Get all guess the word related to these subcategories
      const guessTheWords = await trx(GUESS_THE_WORD_SCHEMA.TABLE)
        .whereIn(GUESS_THE_WORD_SCHEMA.FIELDS.SUBCATEGORY, [...existingIds])
        .select(
          GUESS_THE_WORD_SCHEMA.FIELDS.ID,
          GUESS_THE_WORD_SCHEMA.FIELDS.IMAGE,
          GUESS_THE_WORD_SCHEMA.FIELDS.SUBCATEGORY
        );

      // Get all fun n learn story related to these subcategories
      const funNLearnStories = await trx(FUN_N_LEARN_STORY_SCHEMA.TABLE)
        .whereIn(FUN_N_LEARN_STORY_SCHEMA.FIELDS.SUBCATEGORY, [...existingIds])
        .select(
          FUN_N_LEARN_STORY_SCHEMA.FIELDS.ID,
          FUN_N_LEARN_STORY_SCHEMA.FIELDS.IMAGE,
          FUN_N_LEARN_STORY_SCHEMA.FIELDS.SUBCATEGORY
        );

      // Get all audio question related to these subcategories
      const audioQuestions = await trx(AUDIO_QUESTION_SCHEMA.TABLE)
        .whereIn(AUDIO_QUESTION_SCHEMA.FIELDS.SUBCATEGORY, [...existingIds])
        .select(
          AUDIO_QUESTION_SCHEMA.FIELDS.ID,
          AUDIO_QUESTION_SCHEMA.FIELDS.AUDIO,
          AUDIO_QUESTION_SCHEMA.FIELDS.AUDIO_TYPE,
          AUDIO_QUESTION_SCHEMA.FIELDS.SUBCATEGORY
        );

      // Delete data related to subcategories
      // Delete quizzes (rows)
      await trx(QUIZZ_SCHEMA.TABLE)
        .whereIn(QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_ID, [...existingIds])
        .del();

      // Delete questions (rows)
      await trx(QUESTION_SCHEMA.TABLE)
        .whereIn(QUESTION_SCHEMA.FIELDS.SUBCATEGORY, [...existingIds])
        .del();

      // Delete subcategory levels (rows)
      await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
        .whereIn(SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAIN_SUBCAT_ID, [
          ...existingIds,
        ])
        .del();

      // Delete subcategories
      await trx(SUBCATEGORY_SCHEMA.TABLE)
        .whereIn(SUBCATEGORY_SCHEMA.FIELDS.ID, [...existingIds])
        .del();

      // Delete web_seo (type=[2,3,4], quizz_mode ∈ [1,2,3,4,5])
      const quizzModes = [1, 2, 3, 4, 5];
      await this.webSeoService.deleteWebSEOByItem(trx, {
        type: TypeModeGame.SUBCATEGORY,
        itemIds: [...existingIds],
        quizModes: quizzModes,
        childType: [TypeModeGame.QUIZ, TypeModeGame.SUBCATEGORY_LEVEL], // Also delete SEO of quizzes under these subcategories
      });

      // Delete faq (type=[2,3,4], quizz_mode ∈ [1,2,3,4,5])
      await this.faqService.deleteFaqsByItem(trx, {
        type: TypeModeGame.SUBCATEGORY,
        itemIds: [...existingIds],
        quizModes: quizzModes,
        childType: [TypeModeGame.QUIZ, TypeModeGame.SUBCATEGORY_LEVEL], // Also delete FAQs of quizzes under these subcategories
      });

      // TO DO: Detele Fun n Learn data, Audio questions, Maths questions
      // ...  (Will implement after the main features are done)

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

      // TODO: Cache Manager
      // Will implement in separate cache manager service

      return {
        error: false,
        message: `Deleted ${existingIds.size} subcategories successfully`,
        data: { deleted: [...existingIds], missing },
      };
    } catch (e) {
      await trx.rollback();
      this.logger.error(`Failed to delete subcategories`, e);
      throw e;
    }
  }

  /**
   * Get subcategory detail with related data
   */
  async getSubcategoryDetail(params: {
    id?: number;
    slug?: string;
    languageId?: number;
  }): Promise<{
    error: boolean;
    message?: string;
    data: SubcategoryDetailDto | null;
  }> {
    try {
      // Validate required params
      if (!params.slug && !params.id) {
        return {
          error: true,
          message: 'Not found (subcategory ID or slug is required)',
          data: null,
        };
      }

      // Generate cache key based on available parameter
      const cacheKey = params.id
        ? `${CacheKey.UserSubcategoryDetail}language:${params.languageId}:id:${params.id}`
        : `${CacheKey.UserSubcategoryDetail}language:${params.languageId}:slug:${params.slug}`;

      // Try getting from cache first
      const cached = await this.redisService.get<SubcategoryDetailDto>(
        cacheKey
      );

      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return { error: false, data: cached };
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
        return {
          error: true,
          message: 'Not found (subcategory does not exist or inactive)',
          data: null,
        };
      }

      // Parse web_seo JSON string to object
      data.web_seo = JSON.parse(data.web_seo);

      // Get FAQ data separately as it's a one-to-many relationship
      const faq = await this.dbService.connection
        .table(FAQ_SCHEMA.TABLE)
        .where({
          type: TypeModeGame.SUBCATEGORY,
          subcategory_id: data.id,
          quizz_mode: QuizMode.QUIZ_HQ,
        });

      // Transform data to match DTO
      const result: SubcategoryDetailDto = transformToString({
        ...data,
        image: data.image
          ? urlJoin(BASE_URL, SUBCATEGORY_IMAGE_PATH, data.image)
          : '',
        thumb_image: data.image
          ? urlJoin(BASE_URL, SUBCATEGORY_THUMB_PATH, data.image)
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
      await this.redisService.set(cacheKey, result, CACHE_TTL_MAX);

      // Cache with alternate key
      const altKey = params.id
        ? `${CacheKey.UserSubcategoryDetail}language:${params.languageId}:slug:${data.slug}`
        : `${CacheKey.UserSubcategoryDetail}language:${params.languageId}:id:${data.id}`;
      await this.redisService.set(altKey, result, CACHE_TTL_MAX);

      this.logger.debug(
        `Cached subcategory data for ${cacheKey} and ${altKey}`
      );

      return { error: false, data: result };
    } catch (error) {
      this.logger.error('Failed to get subcategory detail', error);
      return {
        error: true,
        message: 'Failed to get subcategory detail',
        data: null,
      };
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
