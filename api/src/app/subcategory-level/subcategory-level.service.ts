import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { WebSeoService } from '../web-seo/web-seo.service';
import { HelpersService } from '../helpers/helpers.service';
import {
  FileUploadService,
  FileUploadOptions,
} from '../../core/file-upload/file-upload.service';
import { FaqService } from '../faq/faq.service';
import { CacheKey } from '../../common/constants/cache-key';
import {
  BASE_URL,
  FE_URL,
  QUIZ_HQ_SLUG,
  SUBCATEGORY_LEVEL_IMAGE_PATH,
  SUBCATEGORY_LEVEL_THUMB_PATH,
  SUBCATEGORY_LEVEL_THUMB_PATH_SMALL,
  QUIZZES_IMAGE_PATH,
  QUESTION_IMG_PATH,
  MAX_LIMIT,
  OrderBy,
  QuizMode,
  TypeModeGame,
  CACHE_TTL_MAX,
} from '../../common/constants/app';
import { CreateSubcategoryLevelDto } from './dto/create-subcategory-level.dto';
import { EditSubcategoryLevelDto } from './dto/edit-subcategory-level.dto';
import { SubcategoryLevelDetailDto } from './dto/subcategory-level.dto';
import { SubcategoryLevelSortBy } from '../../common/constants/subcategory-level';
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
} from '../../core/database/schemas';

@Injectable()
export class SubcategoryLevelService {
  private readonly logger = new Logger(SubcategoryLevelService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService,
    private readonly fileUploadService: FileUploadService,
    private readonly faqService: FaqService,
    private readonly webSeoService: WebSeoService,
    private readonly helpersService: HelpersService
  ) {}

  /**
   * Handle image upload for subcategory level
   * @param file - The uploaded image file
   * @returns The saved image filename
   */
  private async handleImageUpload(file: Express.Multer.File): Promise<string> {
    try {
      const options: FileUploadOptions = {
        directory: SUBCATEGORY_LEVEL_IMAGE_PATH,
        generateThumbnail: true,
        allowedMimes: ['image/jpeg', 'image/png', 'image/webp'],
        maxSize: 5 * 1024 * 1024, // 5MB
      };

      return await this.fileUploadService.uploadFile(file, options);
    } catch (error) {
      throw new Error(`Failed to upload subcategory level image:`, {
        cause: error,
      });
    }
  }

  /**
   * Build subcategory level data object from DTO
   * @param dto - The DTO containing subcategory level data
   * @param existingSubcategoryLevel - Optional existing subcategory level data for updates
   * @returns Formatted subcategory level data object
   */
  private buildSubcategoryLevelDataFromDto(
    dto: Partial<CreateSubcategoryLevelDto>,
    existingSubcategoryLevel?: any
  ): any {
    const fields = [
      SUBCATEGORY_LEVEL_SCHEMA.FIELDS.NAME,
      SUBCATEGORY_LEVEL_SCHEMA.FIELDS.LANGUAGE_ID,
      SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAINCAT_ID,
      SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAIN_SUBCAT_ID,
      SUBCATEGORY_LEVEL_SCHEMA.FIELDS.SLUG,
      SUBCATEGORY_LEVEL_SCHEMA.FIELDS.STATUS,
      SUBCATEGORY_LEVEL_SCHEMA.FIELDS.IS_PREMIUM,
      SUBCATEGORY_LEVEL_SCHEMA.FIELDS.COINS,
      SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ROW_ORDER,
      SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ENABLE_FAQ,
      SUBCATEGORY_LEVEL_SCHEMA.FIELDS.LEVEL,
      SUBCATEGORY_LEVEL_SCHEMA.FIELDS.IS_COMING_SOON,
    ];

    const subcategoryLevelData: any = {};

    for (const field of fields) {
      if (dto[field as keyof CreateSubcategoryLevelDto] !== undefined) {
        subcategoryLevelData[field] =
          dto[field as keyof CreateSubcategoryLevelDto];
      } else if (
        !existingSubcategoryLevel &&
        field === SUBCATEGORY_LEVEL_SCHEMA.FIELDS.STATUS
      ) {
        subcategoryLevelData[field] = 1;
      } else if (
        !existingSubcategoryLevel &&
        field === SUBCATEGORY_LEVEL_SCHEMA.FIELDS.IS_PREMIUM
      ) {
        subcategoryLevelData[field] = 0;
      } else if (
        !existingSubcategoryLevel &&
        field === SUBCATEGORY_LEVEL_SCHEMA.FIELDS.COINS
      ) {
        subcategoryLevelData[field] = 0;
      } else if (
        !existingSubcategoryLevel &&
        field === SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ENABLE_FAQ
      ) {
        subcategoryLevelData[field] = 1;
      } else if (
        !existingSubcategoryLevel &&
        field === SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ROW_ORDER
      ) {
        subcategoryLevelData[field] = 0;
      } else if (
        !existingSubcategoryLevel &&
        field === SUBCATEGORY_LEVEL_SCHEMA.FIELDS.LEVEL
      ) {
        subcategoryLevelData[field] = 0;
      } else if (
        !existingSubcategoryLevel &&
        field === SUBCATEGORY_LEVEL_SCHEMA.FIELDS.IS_COMING_SOON
      ) {
        subcategoryLevelData[field] = 0;
      }
    }

    return subcategoryLevelData;
  }

  /**
   * [Admin] Create a new subcategory level
   *
   * @param createSubcategoryLevelDto - Data for creating the subcategory level
   * @returns Created subcategory level data or error response
   */
  async createSubcategoryLevel(
    createSubcategoryLevelDto: CreateSubcategoryLevelDto
  ) {
    try {
      // Start transaction
      const trx = await this.dbService.connection.transaction();

      try {
        // Generate and format slug
        if (createSubcategoryLevelDto.slug) {
          try {
            // Validate and format provided slug
            this.helpersService.assertValid(createSubcategoryLevelDto.slug);

            // Check unique
            const isUnique = await this.helpersService.isUniqueGlobal(
              createSubcategoryLevelDto.slug
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
        } else if (createSubcategoryLevelDto.subcategory_level_name) {
          // If no slug is provided, generate it from subcategory level name
          createSubcategoryLevelDto.slug =
            await this.helpersService.ensureValidAndUnique(
              createSubcategoryLevelDto.subcategory_level_name
            );
        }

        // Handle image upload if present
        let imageName = '';
        if (createSubcategoryLevelDto.image_file) {
          imageName = await this.handleImageUpload(
            createSubcategoryLevelDto.image_file
          );
        }

        // Extract only the fields that belong to subcategory level table
        const subcategoryLevelData = this.buildSubcategoryLevelDataFromDto({
          ...createSubcategoryLevelDto,
        });
        subcategoryLevelData.image = imageName;

        // Insert the subcategory level
        const [insertedId] = await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE).insert(
          subcategoryLevelData
        );

        if (!insertedId) {
          await trx.rollback();
          return {
            error: true,
            message: 'Failed to create subcategory level',
            data: null,
          };
        }

        // Insert web SEO data
        await this.webSeoService.createWebSeoEntry(
          trx,
          insertedId,
          TypeModeGame.SUBCATEGORY_LEVEL,
          createSubcategoryLevelDto,
          SUBCATEGORY_LEVEL_SCHEMA.FIELDS.NAME // Use 'subcategory_level_name' as title field
        );

        // Create FAQ entries if enabled
        await this.faqService.createFaqEntries(
          trx,
          insertedId,
          TypeModeGame.SUBCATEGORY_LEVEL,
          createSubcategoryLevelDto
        );

        // Fetch the created subcategory level before committing
        const createdSubcategoryLevel = await trx(
          SUBCATEGORY_LEVEL_SCHEMA.TABLE
        )
          .where(SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID, insertedId)
          .first();

        // Commit transaction after all operations are done
        await trx.commit();

        // TODO: Cache Manager
        // Will implement in separate cache manager service

        return {
          error: false,
          message: 'Subcategory Level created successfully',
          data: transformToString(createdSubcategoryLevel),
        };
      } catch (trxError) {
        await trx.rollback();
        throw trxError;
      }
    } catch (error) {
      this.logger.error('Error creating subcategory level', error);
      throw new Error('Error creating subcategory level', { cause: error });
    }
  }

  /**
   * [Admin] Edit an existing subcategory level
   *
   * @param id - ID of the subcategory level to edit
   * @param editSubcategoryLevelDto - Data for editing the subcategory level
   * @returns Updated subcategory level data or error response
   */
  async editSubcategoryLevel(id: number, dto: EditSubcategoryLevelDto) {
    const trx = await this.dbService.connection.transaction();
    try {
      const existing = await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
        .where(`${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID}`, id)
        .first();
      if (!existing) {
        await trx.rollback();
        return {
          error: true,
          message: 'Subcategory level not found',
          data: null,
        };
      }

      // Get web SEO ID
      const webSeo = await trx(WEB_SEO_SCHEMA.TABLE)
        .where(WEB_SEO_SCHEMA.FIELDS.SUBCATEGORY_LEVEL_ID, id)
        .andWhere(WEB_SEO_SCHEMA.FIELDS.TYPE, TypeModeGame.SUBCATEGORY_LEVEL)
        .first();

      if (!webSeo) {
        await trx.rollback();
        return {
          error: true,
          message: 'Subcategory level SEO data not found',
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
        } else if (!existing.slug && dto.subcategory_level_name) {
          // Case 2: No existing slug, generate from subcategory level name
          dto.slug = await this.helpersService.ensureValidAndUnique(
            dto.subcategory_level_name
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
        await this.deleteSubcategoryLevelImages(existing.image);
        imageName = '';
      }

      // Check image_file next
      if (dto.image_file) {
        if (existing.image) {
          await this.deleteSubcategoryLevelImages(existing.image);
        }
        imageName = await this.handleImageUpload(dto.image_file);
      }

      // Subcategory level data
      const subcategoryLevelData = this.buildSubcategoryLevelDataFromDto(
        dto,
        existing
      );
      if (imageName !== existing.image) {
        subcategoryLevelData.image = imageName;
      }

      // Update subcategory level
      if (Object.keys(subcategoryLevelData).length > 0) {
        await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
          .where(`${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID}`, id)
          .update(subcategoryLevelData);
      }

      // Update SEO + FAQ
      await this.webSeoService.updateWebSeoEntry(
        trx,
        id,
        TypeModeGame.SUBCATEGORY_LEVEL,
        dto,
        SUBCATEGORY_LEVEL_SCHEMA.FIELDS.NAME // Use 'subcategory_level_name' as title field
      );
      if (dto.enable_faq !== undefined) {
        await this.faqService.updateFaqEntries(
          trx,
          id,
          TypeModeGame.SUBCATEGORY_LEVEL,
          dto
        );
      }

      // Update quiz and questions of the subcategory level if language or category or subcategory changed
      if (
        dto.language_id !== undefined ||
        dto.maincat_id !== undefined ||
        dto.main_subcat_id !== undefined
      ) {
        // Update quizzes related to this subcategory level
        await trx(QUIZZ_SCHEMA.TABLE)
          .where(QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_LEVEL_ID, id)
          .update({
            [QUIZZ_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id
              ? dto.language_id
              : existing.language_id,
            [QUIZZ_SCHEMA.FIELDS.MAINCAT_ID]: dto.maincat_id
              ? dto.maincat_id
              : existing.maincat_id,
            [QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_ID]: dto.main_subcat_id
              ? dto.main_subcat_id
              : existing.main_subcat_id,
          });

        // Update questions related to this subcategory level
        await trx(QUESTION_SCHEMA.TABLE)
          .where(QUESTION_SCHEMA.FIELDS.SUBCATEGORY_LEVEL, id)
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
          });
      }

      const updatedSubcategoryLevel = await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
        .where(`${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID}`, id)
        .first();
      await trx.commit();

      // TODO: Cache Manager
      // Will implement in separate cache manager service

      return {
        error: false,
        message: 'Subcategory level updated successfully',
        data: transformToString(updatedSubcategoryLevel),
      };
    } catch (e) {
      await trx.rollback();
      this.logger.error(`Failed to update Subcategory Level ID ${id}`, e);
      throw new Error(`Failed to update Subcategory Level ID ${id}`, {
        cause: e,
      });
    }
  }

  /**
   * [Admin] Get all Subcategory levels with pagination and optional search
   * @param query - Query parameters for pagination and search
   * @returns Paginated list of Subcategory levels
   */
  async getAllSubcategoryLevels(query: {
    limit: number;
    offset: number;
    search?: string;
    sortBy?: SubcategoryLevelSortBy;
    order?: OrderBy.DESC | OrderBy.ASC;
    languageId?: number;
    categoryId?: number;
    subcategoryId?: number;
  }) {
    const {
      limit = 20,
      offset = 0,
      search,
      sortBy = SubcategoryLevelSortBy.ID,
      order = OrderBy.DESC,
      languageId,
      categoryId,
      subcategoryId,
    } = query;

    const filterIds = {
      languageId,
      categoryId,
      subcategoryId,
    };

    const friendlyNames: Record<string, string> = {
      languageId: 'Language ID',
      categoryId: 'Category ID',
      subcategoryId: 'Subcategory ID',
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

    const validSortFields = Object.values(SubcategoryLevelSortBy);
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : SubcategoryLevelSortBy.ID;

    const db = this.dbService
      .connection(SUBCATEGORY_LEVEL_SCHEMA.TABLE + ' as sl')
      .leftJoin(`${LANGUAGE_SCHEMA.TABLE} as l`, 'l.id', 'sl.language_id')
      .leftJoin(`${CATEGORY_SCHEMA.TABLE} as c`, 'c.id', 'sl.maincat_id')
      .leftJoin(`${SUBCATEGORY_SCHEMA.TABLE} as s`, 's.id', 'sl.main_subcat_id')
      .leftJoin(
        function () {
          // Subquery to count number of questions
          this.select(QUESTION_SCHEMA.FIELDS.SUBCATEGORY_LEVEL)
            .count('* as no_of_que')
            .from(`${QUESTION_SCHEMA.TABLE}`)
            .groupBy(QUESTION_SCHEMA.FIELDS.SUBCATEGORY_LEVEL)
            .as('qq');
        },
        'qq.subcategory_level',
        'sl.id'
      )
      .select(
        'sl.*',
        'l.language as language_name',
        'c.category_name',
        'c.slug as category_slug',
        's.subcategory_name',
        's.slug as subcategory_slug',
        this.dbService.connection.raw('IFNULL(qq.no_of_que, 0) as no_of_que')
      );

    // Add filter conditions
    if (languageId) {
      db.where('sl.language_id', languageId);
    }

    if (categoryId) {
      db.where('sl.maincat_id', categoryId);
    }

    if (subcategoryId) {
      db.where('sl.main_subcat_id', subcategoryId);
    }

    // Search by subcategory level name or slug
    if (search) {
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&');
      db.where((builder) => {
        builder
          .where(
            `sl.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.NAME}`,
            'like',
            `%${sanitizedSearch}%`
          )
          .orWhere(
            `sl.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.SLUG}`,
            'like',
            `%${sanitizedSearch}%`
          );
      });
    }

    const totalQuery = db.clone(); // Clone the query for total count

    // Apply sort, limit, offset
    const subcategoryLevels = await db
      .orderBy(sortField, order)
      .limit(limit)
      .offset(offset);

    const results = subcategoryLevels.map((subcategoryLevel) => {
      const image = subcategoryLevel.image
        ? urlJoin(
            BASE_URL,
            SUBCATEGORY_LEVEL_IMAGE_PATH,
            subcategoryLevel.image
          )
        : null;

      const thumbnail = subcategoryLevel.image
        ? urlJoin(
            BASE_URL,
            SUBCATEGORY_LEVEL_THUMB_PATH_SMALL,
            subcategoryLevel.image
          )
        : null;

      const prefixLang = subcategoryLevel.language_id === 14 ? '/en' : '/en'; // Default to English for now
      const shareUrl = `${FE_URL}${prefixLang}/${QUIZ_HQ_SLUG}/${subcategoryLevel.category_slug}/${subcategoryLevel.subcategory_slug}/${subcategoryLevel.slug}`;

      return {
        ...subcategoryLevel,
        image_url: image,
        thumbnail_url: thumbnail,
        share_url: shareUrl,
      };
    });

    const total = await totalQuery.clearSelect().count({ count: '*' }).first();

    return {
      error: false,
      message: 'Subcategory levels retrieved successfully',
      data: {
        total: Number(total?.count || 0),
        limit,
        offset,
        subcategory_levels: results,
      },
    };
  }

  /**
   * [Admin] Get detailed information about a subcategory level
   * @param id - ID of the subcategory level to retrieve
   * @returns Detailed subcategory level information or error response
   */
  async getSubcategoryLevelAdminDetails(id: number) {
    if (!isValidId(id)) {
      return {
        error: true,
        message: 'Subcategory level ID is required',
        data: null,
      };
    }
    const trx = await this.dbService.connection.transaction();
    try {
      // Fetch subcategory level details
      const subcategoryLevel = await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
        .where(`${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID}`, id)
        .first();
      if (!subcategoryLevel) {
        await trx.rollback();
        return {
          error: true,
          message: 'Subcategory level not found',
          data: null,
        };
      }

      // Fetch related web SEO data
      const webSeo = await trx(WEB_SEO_SCHEMA.TABLE)
        .where({
          [WEB_SEO_SCHEMA.FIELDS.SUBCATEGORY_LEVEL_ID]: id,
          [WEB_SEO_SCHEMA.FIELDS.TYPE]: TypeModeGame.SUBCATEGORY_LEVEL,
        })
        .first();
      if (!webSeo) {
        await trx.rollback();
        return {
          error: true,
          message: 'Subcategory level SEO data not found',
          data: null,
        };
      }

      // Fetch FAQ entries related to this subcategory level
      const faq = await trx(FAQ_SCHEMA.TABLE)
        .where({
          [FAQ_SCHEMA.FIELDS.SUBCATEGORY_LEVEL_ID]: id,
          [FAQ_SCHEMA.FIELDS.TYPE]: TypeModeGame.SUBCATEGORY_LEVEL,
        })
        .select('*');

      // Format image URLs
      const getSubcategoryLevelDetail = {
        ...subcategoryLevel,
        image_url: subcategoryLevel.image
          ? urlJoin(
              BASE_URL,
              SUBCATEGORY_LEVEL_IMAGE_PATH,
              subcategoryLevel.image
            )
          : null,
        thumbnail_url: subcategoryLevel.image
          ? urlJoin(
              BASE_URL,
              SUBCATEGORY_LEVEL_THUMB_PATH_SMALL,
              subcategoryLevel.image
            )
          : null,
        web_seo: webSeo ?? null,
        faq: faq ?? [],
      };

      // Return formatted subcategory level data
      await trx.commit();
      return {
        error: false,
        message: 'Subcategory level details retrieved successfully',
        data: transformToString(getSubcategoryLevelDetail),
      };
    } catch (error) {
      await trx.rollback();
      this.logger.error(`Failed to retrieve Subcategory Level ID ${id}`, error);
      throw new Error(`Failed to retrieve Subcategory Level ID ${id}`, {
        cause: error,
      });
    }
  }

  /**
   * [Admin] Delete Subcategory levels by IDs
   * @param ids - Array of Subcategory levels IDs to delete
   * @returns Success or error response
   */
  private readonly THUMB_SIZES = ['100x100', '64x64', '50x50'];

  private async deleteSubcategoryLevelImages(imageName?: string) {
    if (!imageName) return;
    // Main image
    await this.fileUploadService.deleteFile(
      imageName,
      SUBCATEGORY_LEVEL_IMAGE_PATH
    );
    // Thumbnail
    for (const size of this.THUMB_SIZES) {
      // Depending on the size, delete the corresponding thumbnail
      await this.fileUploadService.deleteFile(
        `thumbs/${size}/${imageName}`,
        SUBCATEGORY_LEVEL_IMAGE_PATH
      );
    }
  }

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

  async deleteSubcategoryLevels(ids: number[]) {
    const trx = await this.dbService.connection.transaction();
    try {
      // Get data to delete
      const subcategoryLevels = await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
        .whereIn(SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID, ids)
        .select(
          SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID,
          SUBCATEGORY_LEVEL_SCHEMA.FIELDS.IMAGE
        );

      if (subcategoryLevels.length === 0) {
        await trx.rollback();
        return {
          error: true,
          message: 'Subcategory Level not found',
          data: { ids },
        };
      }

      const existingIds = new Set(
        subcategoryLevels.map((q) =>
          Number(q[SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID])
        )
      );
      const missing = ids.filter((id) => !existingIds.has(Number(id)));

      // Get all quizzes related to these subcategory levels
      const quizzes = await trx(QUIZZ_SCHEMA.TABLE)
        .whereIn(QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_LEVEL_ID, [...existingIds])
        .select(
          QUIZZ_SCHEMA.FIELDS.ID,
          QUIZZ_SCHEMA.FIELDS.IMAGE,
          QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_LEVEL_ID,
          QUIZZ_SCHEMA.FIELDS.IS_FEATURED
        );

      // Get all questions related to these subcategory levels
      const questions = await trx(QUESTION_SCHEMA.TABLE)
        .whereIn(QUESTION_SCHEMA.FIELDS.SUBCATEGORY_LEVEL, [...existingIds])
        .select(
          QUESTION_SCHEMA.FIELDS.ID,
          QUESTION_SCHEMA.FIELDS.IMAGE,
          QUESTION_SCHEMA.FIELDS.SUBCATEGORY_LEVEL
        );

      // Delete data related to subcategory levels
      // Delete quizzes (rows)
      await trx(QUIZZ_SCHEMA.TABLE)
        .whereIn(QUIZZ_SCHEMA.FIELDS.MAIN_SUBCAT_LEVEL_ID, [...existingIds])
        .del();

      // Delete questions (rows)
      await trx(QUESTION_SCHEMA.TABLE)
        .whereIn(QUESTION_SCHEMA.FIELDS.SUBCATEGORY_LEVEL, [...existingIds])
        .del();

      // Delete subcategory levels
      await trx(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
        .whereIn(SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID, [...existingIds])
        .del();

      // Delete web_seo (type=3, quizz_mode ∈ [1,2,3,4])
      const quizzModes = [1, 2, 3, 4];
      await this.webSeoService.deleteWebSEOByItem(trx, {
        type: TypeModeGame.SUBCATEGORY_LEVEL,
        itemIds: [...existingIds],
        quizModes: quizzModes,
        childType: TypeModeGame.QUIZ, // Also delete SEO of quizzes under these subcategory levels
      });

      // Delete faq (type=3, quizz_mode ∈ [1,2,3,4])
      await this.faqService.deleteFaqsByItem(trx, {
        type: TypeModeGame.SUBCATEGORY_LEVEL,
        itemIds: [...existingIds],
        quizModes: quizzModes,
        childType: TypeModeGame.QUIZ, // Also delete FAQs of quizzes under these subcategory levels
      });

      // Commit transaction
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

      await Promise.all(
        subcategoryLevels.map(async (sl) => {
          try {
            await this.deleteSubcategoryLevelImages(
              sl[SUBCATEGORY_LEVEL_SCHEMA.FIELDS.IMAGE]
            );
          } catch (e) {
            this.logger?.warn?.(
              `Delete subcategory level image failed (slId=${sl.id})`,
              e
            );
          }
        })
      );

      // TODO: Cache Manager
      // Will implement in separate cache manager service

      return {
        error: false,
        message: `Deleted ${existingIds.size} subcategory level(s)`,
        data: { deleted: [...existingIds], missing },
      };
    } catch (e) {
      await trx.rollback();
      this.logger.error(`Failed to delete Subcategory Levels`, e);
      throw e;
    }
  }

  /**
   * Get subcategory level detail with related data
   */
  async getSubcategoryLevelDetail(params: {
    id?: number;
    slug?: string;
    languageId?: number;
  }): Promise<{
    error: boolean;
    message?: string;
    data: SubcategoryLevelDetailDto | null;
  }> {
    try {
      // Validate required params
      if (!params.slug && !params.id) {
        return {
          error: true,
          message: 'Either slug or id is required',
          data: null,
        };
      }

      // Generate cache key based on available parameter
      const cacheKey = params.id
        ? `${CacheKey.UserSubcategoryLevelDetail}language:${params.languageId}:id:${params.id}`
        : `${CacheKey.UserSubcategoryLevelDetail}language:${params.languageId}:slug:${params.slug}`;

      // Try getting from cache first
      const cached = await this.redisService.get<SubcategoryLevelDetailDto>(
        cacheKey
      );

      if (cached) {
        this.logger.debug(`Cache hit for ${cacheKey}`);
        return { error: false, data: cached };
      }

      // Get subcategory level detail with joins
      const query = this.dbService.connection
        .table(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
        .leftJoin(
          CATEGORY_SCHEMA.TABLE,
          `${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.ID}`,
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAINCAT_ID}`
        )
        .leftJoin(
          SUBCATEGORY_SCHEMA.TABLE,
          `${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.ID}`,
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.MAIN_SUBCAT_ID}`
        )
        .where(
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.STATUS}`,
          1
        );

      // Add web SEO join using service
      this.webSeoService.addWebSeoJoin(
        query,
        `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.SLUG}`
      );

      // Add dynamic filters
      if (params.id) {
        query.where(
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.ID}`,
          params.id
        );
      }
      if (params.slug) {
        query.where(
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.SLUG}`,
          params.slug
        );
      }
      if (params.languageId) {
        query.where(
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.${SUBCATEGORY_LEVEL_SCHEMA.FIELDS.LANGUAGE_ID}`,
          params.languageId
        );
      }

      // Use JSON_OBJECT for web_seo fields to automatically group them
      // To make sure we get the correct data structure which match the response data of PHP API
      const data = await query
        .select([
          `${SUBCATEGORY_LEVEL_SCHEMA.TABLE}.*`,
          `${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.SLUG} as slug_category`,
          `${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.SLUG} as slug_subcategory`,
          this.webSeoService.getWebSeoSelectQuery(),
        ])
        .first();

      if (!data) {
        return {
          error: true,
          message: 'Subcategory level not found',
          data: null,
        };
      }

      // Parse web_seo JSON string to object
      data.web_seo = JSON.parse(data.web_seo);

      // Get FAQ data separately as it's a one-to-many relationship
      const faq = await this.dbService.connection
        .table(FAQ_SCHEMA.TABLE)
        .where({
          type: TypeModeGame.SUBCATEGORY_LEVEL,
          subcategory_level_id: data.id,
          quizz_mode: QuizMode.QUIZ_HQ,
        });

      // Transform data to match DTO and response data of PHP API
      const result: SubcategoryLevelDetailDto = transformToString({
        ...data,
        image: data.image
          ? urlJoin(BASE_URL, SUBCATEGORY_LEVEL_IMAGE_PATH, data.image)
          : '',
        thumb_image: data.image
          ? urlJoin(BASE_URL, SUBCATEGORY_LEVEL_THUMB_PATH, data.image)
          : '',
        faq,
        share_url: this.generateShareUrl(
          data.slug_category,
          data.slug_subcategory,
          data.slug,
          params.languageId
        ),
      });

      // Cache with both keys
      await this.redisService.set(cacheKey, result, CACHE_TTL_MAX);

      // Cache with alternate key
      const altKey = params.id
        ? `${CacheKey.UserSubcategoryLevelDetail}language:${params.languageId}:slug:${data.slug}`
        : `${CacheKey.UserSubcategoryLevelDetail}language:${params.languageId}:id:${data.id}`;
      await this.redisService.set(altKey, result, CACHE_TTL_MAX);

      this.logger.debug(
        `Cached subcategory level data for ${cacheKey} and ${altKey}`
      );

      return { error: false, data: result };
    } catch (error) {
      this.logger.error('Failed to get subcategory level detail', error);
      return {
        error: true,
        message: 'Failed to get subcategory level detail',
        data: null,
      };
    }
  }

  /**
   * Generate share URL for subcategory level
   */
  private generateShareUrl(
    categorySlug?: string,
    subcategorySlug?: string,
    levelSlug?: string,
    languageId?: number
  ): string {
    const prefixLang = languageId === 14 ? 'en' : '';
    return `${FE_URL}${prefixLang}/${QUIZ_HQ_SLUG}/${categorySlug}/${subcategorySlug}/${levelSlug}`;
  }
}
