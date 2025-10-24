import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { CategoryService } from '../category/category.service';
import { OrderBy, MAX_LIMIT } from '../../common/constants/app';
import { LanguageDetailDto } from './dto/language.dto';
import { CreateLanguageDto } from './dto/create-language.dto';
import { EditLanguageDto } from './dto/edit-language.dto';
import { LanguageSortBy } from '../../common/constants/language';
import { transformToString } from '../../common/utils/transform.util';
import { isValidId } from '../../common/utils/number.util';
import {
  LANGUAGE_SCHEMA,
  CATEGORY_SCHEMA,
  QUESTION_SCHEMA,
} from '../../core/database/schemas';

@Injectable()
export class LanguageService {
  private readonly logger = new Logger(LanguageService.name);

  constructor(
    private readonly dbService: DatabaseService,
    private readonly categoryService: CategoryService
  ) {}

  /**
   * Build language data object from DTO
   * @param dto - The DTO containing language data
   * @param existingLanguage - Optional existing language data for updates
   * @returns Formatted language data object
   */
  private buildLanguageDataFromDto(
    dto: Partial<CreateLanguageDto>,
    existingLanguage?: LanguageDetailDto
  ): Record<string, string | number> {
    const fields = [
      LANGUAGE_SCHEMA.FIELDS.LANGUAGE,
      LANGUAGE_SCHEMA.FIELDS.CODE,
      LANGUAGE_SCHEMA.FIELDS.STATUS,
      LANGUAGE_SCHEMA.FIELDS.TYPE,
    ];

    const languageData: Record<string, string | number> = {};

    for (const field of fields) {
      const value = dto[field as keyof CreateLanguageDto];
      if (value !== undefined) {
        languageData[field] = value;
      } else if (!existingLanguage && field === LANGUAGE_SCHEMA.FIELDS.STATUS) {
        languageData[field] = 0;
      } else if (!existingLanguage && field === LANGUAGE_SCHEMA.FIELDS.TYPE) {
        languageData[field] = 0;
      }
    }

    return languageData;
  }

  /**
   * [Admin] Create a new language
   *
   * @param createLanguageDto - Data for creating the language
   * @returns Created language data or error response
   */
  async createLanguage(createLanguageDto: CreateLanguageDto) {
    try {
      // Start transaction
      const trx = await this.dbService.connection.transaction();

      try {
        // Extract only the fields that belong to language table
        const languageData = this.buildLanguageDataFromDto({
          ...createLanguageDto,
        });

        // Insert the language
        const [insertedId] = await trx(LANGUAGE_SCHEMA.TABLE).insert(
          languageData
        );

        if (!insertedId) {
          await trx.rollback();
          return {
            error: true,
            message: 'Failed to create language',
            data: null,
          };
        }

        // Fetch the created language before committing
        const createdLanguage = await trx(LANGUAGE_SCHEMA.TABLE)
          .where(LANGUAGE_SCHEMA.FIELDS.ID, insertedId)
          .first();

        // Commit transaction after all operations are done
        await trx.commit();

        // TODO: Cache Manager
        // Will implement in separate cache manager service

        return {
          error: false,
          message: 'Language created successfully',
          data: transformToString(createdLanguage),
        };
      } catch (trxError) {
        await trx.rollback();
        throw trxError;
      }
    } catch (error) {
      this.logger.error('Error creating language', error);
      throw new Error('Error creating language', { cause: error });
    }
  }

  /**
   * Delete related data for given language IDs
   * @param ids - Array of language IDs
   * @param trx - Transaction instance
   */
  private async deleteRelatedData(ids: number[], trx: any) {
    // Get all categories related to these languages
    // Delete related game modes: Quiz HQ, Fun N Learn, Guess the word, Audio question, Math quiz
    const categories = await trx(CATEGORY_SCHEMA.TABLE)
      .whereIn(CATEGORY_SCHEMA.FIELDS.LANGUAGE_ID, ids)
      .select(CATEGORY_SCHEMA.FIELDS.ID);

    const categoryIds = categories.map((c: any) =>
      Number(c[CATEGORY_SCHEMA.FIELDS.ID])
    );
    if (categoryIds.length > 0) {
      await this.categoryService.deleteCategories(categoryIds);
    }

    await trx.commit();
    // TODO: Delete related game modes: Daily Quiz, True/False Quiz, Quiz By Language, Exam Quiz, and Blogs
    // Will implement after having these modules
  }

  /**
   * [Admin] Edit an existing language
   *
   * @param id - ID of the language to edit
   * @param editLanguageDto - Data for editing the language
   * @returns Updated language data or error response
   */
  async editLanguage(id: number, dto: EditLanguageDto) {
    const trx = await this.dbService.connection.transaction();
    try {
      const existing = await trx(LANGUAGE_SCHEMA.TABLE)
        .where(`${LANGUAGE_SCHEMA.FIELDS.ID}`, id)
        .first();
      if (!existing) {
        await trx.rollback();
        return {
          error: true,
          message: 'Language not found',
          data: null,
        };
      }

      // Check if type is being updated to 0 (soft delete)
      if (dto.type === 0 && existing.type !== 0) {
        dto.status = 0; // Also set status to 0 (disabled)
        // Delete related data
        await this.deleteRelatedData([id], trx);
      }

      // Language data
      const languageData = this.buildLanguageDataFromDto(dto, existing);

      // Update language
      if (Object.keys(languageData).length > 0) {
        await trx(LANGUAGE_SCHEMA.TABLE)
          .where(`${LANGUAGE_SCHEMA.FIELDS.ID}`, id)
          .update(languageData);
      }

      // Commit transaction
      const updatedLanguage = await trx(LANGUAGE_SCHEMA.TABLE)
        .where(`${LANGUAGE_SCHEMA.FIELDS.ID}`, id)
        .first();
      await trx.commit();

      // TODO: Cache Manager
      // Will implement in separate cache manager service

      return {
        error: false,
        message: 'Language updated successfully',
        data: transformToString(updatedLanguage),
      };
    } catch (e) {
      await trx.rollback();
      this.logger.error(`Failed to update Language ID ${id}`, e);
      throw new Error(`Failed to update Language ID ${id}`, { cause: e });
    }
  }

  /**
   * [Admin] Get all languages with pagination and optional search
   * @param query - Query parameters for pagination and search
   * @returns Paginated list of languages
   */
  async getAllLanguages(query: {
    limit: number;
    offset: number;
    search?: string;
    sortBy?: LanguageSortBy;
    order?: OrderBy.DESC | OrderBy.ASC;
    status?: number;
    type?: number;
  }) {
    const {
      limit = 20,
      offset = 0,
      search,
      sortBy = LanguageSortBy.ID,
      order = OrderBy.DESC,
      status,
      type,
    } = query;

    const filterIds = {
      status,
      type,
    };

    const friendlyNames: Record<string, string> = {
      status: 'Status',
      type: 'Type',
    };

    for (const [key, value] of Object.entries(filterIds)) {
      if (value !== undefined && !isValidId(value)) {
        throw new BadRequestException(
          `${friendlyNames[key] || key} must be a positive integer`
        );
      }
    }

    // Add validation for limit and offset
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

    const validSortFields = Object.values(LanguageSortBy);
    const sortField = validSortFields.includes(sortBy)
      ? sortBy
      : LanguageSortBy.ID;

    const db = this.dbService
      .connection(LANGUAGE_SCHEMA.TABLE + ' as l')
      .leftJoin(
        function () {
          // Subquery to count number of questions
          this.select(QUESTION_SCHEMA.FIELDS.LANGUAGE_ID)
            .count('* as no_of_que')
            .from(`${QUESTION_SCHEMA.TABLE}`)
            .groupBy(QUESTION_SCHEMA.FIELDS.LANGUAGE_ID)
            .as('qq');
        },
        'qq.language_id',
        'l.id'
      )
      .select(
        'l.*',
        this.dbService.connection.raw('IFNULL(qq.no_of_que, 0) as no_of_que')
      );

    // Add filter conditions
    if (status !== undefined) {
      db.where('l.status', status); // 0 = Disabled, 1 = Enabled
    }

    if (type !== undefined) {
      db.where('l.type', type); // 0 = Inactive, 1 = Active
    }

    // Search by language name or code
    if (search) {
      const sanitizedSearch = search.replace(/[%_]/g, '\\$&');
      db.where((builder) => {
        builder
          .where(
            `l.${LANGUAGE_SCHEMA.FIELDS.LANGUAGE}`,
            'like',
            `%${sanitizedSearch}%`
          )
          .orWhere(
            `l.${LANGUAGE_SCHEMA.FIELDS.CODE}`,
            'like',
            `%${sanitizedSearch}%`
          );
      });
    }

    const totalQuery = db.clone(); // Clone the query for total count

    // Apply sort, limit, offset
    const languages = await db
      .orderBy(sortField, order)
      .limit(limit)
      .offset(offset);

    const results = languages.map((lang) => transformToString(lang));

    const total = await totalQuery.clearSelect().count({ count: '*' }).first();

    return {
      error: false,
      message: 'Languages retrieved successfully',
      data: {
        total: Number(total?.count || 0),
        limit,
        offset,
        languages: results,
      },
    };
  }

  /**
   * [Admin] Get detailed information about a language
   * @param id - ID of the language to retrieve
   * @returns Detailed language information or error response
   */
  async getLanguageAdminDetails(id: number) {
    if (!isValidId(id)) {
      return {
        error: true,
        message: 'Language ID is required',
        data: null,
      };
    }
    const trx = await this.dbService.connection.transaction();
    try {
      // Fetch language details
      const language = await trx(LANGUAGE_SCHEMA.TABLE)
        .where(`${LANGUAGE_SCHEMA.FIELDS.ID}`, id)
        .first();
      if (!language) {
        await trx.rollback();
        return {
          error: true,
          message: 'Language not found',
          data: null,
        };
      }

      // Return formatted language details
      await trx.commit();
      return {
        error: false,
        message: 'Language details retrieved successfully',
        data: transformToString(language),
      };
    } catch (error) {
      await trx.rollback();
      this.logger.error(`Failed to retrieve Language ID ${id}`, error);
      throw new Error(`Failed to retrieve Language ID ${id}`, {
        cause: error,
      });
    }
  }

  /**
   * [Admin] Delete Languages by IDs
   * @param ids - Array of Languages IDs to delete
   * @returns Success or error response
   */
  async deleteLanguages(ids: number[]) {
    const trx = await this.dbService.connection.transaction();
    try {
      // Get data to delete
      const languages = await trx(LANGUAGE_SCHEMA.TABLE)
        .whereIn(LANGUAGE_SCHEMA.FIELDS.ID, ids)
        .select(LANGUAGE_SCHEMA.FIELDS.ID);

      if (languages.length === 0) {
        await trx.rollback();
        return {
          error: true,
          message: 'Language not found',
          data: { ids },
        };
      }

      const existingIds = new Set(
        languages.map((c) => Number(c[LANGUAGE_SCHEMA.FIELDS.ID]))
      );
      const missing = ids.filter((id) => !existingIds.has(Number(id)));

      // Delete related data
      await this.deleteRelatedData([...existingIds], trx);

      // Delete languages
      await trx(LANGUAGE_SCHEMA.TABLE)
        .whereIn(LANGUAGE_SCHEMA.FIELDS.ID, [...existingIds])
        .del();

      // Commit transaction
      await trx.commit();

      // TODO: Cache Manager
      // Will implement in separate cache manager service

      return {
        error: false,
        message: `Deleted ${existingIds.size} languages successfully`,
        data: { deleted: [...existingIds], missing },
      };
    } catch (e) {
      await trx.rollback();
      this.logger.error(`Failed to delete languages`, e);
      throw new Error(`Failed to delete languages`, { cause: e });
    }
  }
}
