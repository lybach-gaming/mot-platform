import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { WEB_SEO_SCHEMA } from '../../core/database/schemas';
import { getWebSeoJsonObjectSql } from '../../utils/web-seo-json-object';
import { Knex } from 'knex';
import { TypeModeGame, QuizMode } from '../../common/constants/app';
import { WebSeoBaseDto } from './interface/web-seo.interface';

const TYPE_ID_FIELD_MAPPING = {
  [TypeModeGame.QUIZ]: WEB_SEO_SCHEMA.FIELDS.QUIZZ_ID,
  [TypeModeGame.CATEGORY]: WEB_SEO_SCHEMA.FIELDS.MAINCAT_ID,
  [TypeModeGame.SUBCATEGORY]: WEB_SEO_SCHEMA.FIELDS.SUBCATEGORY_ID,
  [TypeModeGame.SUBCATEGORY_LEVEL]: WEB_SEO_SCHEMA.FIELDS.SUBCATEGORY_LEVEL_ID,
  [TypeModeGame.QUIZ_BY_LANGUAGE]:
    WEB_SEO_SCHEMA.FIELDS.QUIZZ_BY_LANGUAGE_LAN_ID,
} as const;

// Define valid types based on the mapping keys
type ValidWebSeoType = keyof typeof TYPE_ID_FIELD_MAPPING;

// Check if type exists in mapping
function isValidWebSeoType(type: TypeModeGame): type is ValidWebSeoType {
  return type in TYPE_ID_FIELD_MAPPING;
}

@Injectable()
export class WebSeoService {
  private readonly logger = new Logger(WebSeoService.name);

  constructor(private readonly dbService: DatabaseService) {}

  /**
   * Get web SEO select query for reuse across services
   */
  getWebSeoSelectQuery() {
    const sql = getWebSeoJsonObjectSql();
    return this.dbService.connection.raw(sql);
  }

  /**
   * Add web SEO join to query builder
   */
  addWebSeoJoin(query: any, slugField: string) {
    return query.leftJoin(
      WEB_SEO_SCHEMA.TABLE,
      `${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.SLUG}`,
      slugField
    );
  }

  /**
   * Create web SEO entry, ussing when creating new items like quizzes, categories, etc.
   * @param trx Transaction object
   * @param itemId ID of the item (quiz, category, etc)
   * @param type Type of the item (4 for quiz, etc)
   * @param dto Data transfer object containing SEO information
   * @param titleField Field name to use as title (e.g. 'quizz_name')
   */
  async createWebSeoEntry(
    trx: Knex.Transaction,
    itemId: number,
    type: TypeModeGame,
    dto: WebSeoBaseDto,
    titleField: string
  ) {
    if (!dto.web_seo) return;

    const webSeoData = {
      [WEB_SEO_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id,
      [WEB_SEO_SCHEMA.FIELDS.QUIZZ_MODE]: dto.quiz_mode,
      [WEB_SEO_SCHEMA.FIELDS.TYPE]: type,
      [WEB_SEO_SCHEMA.FIELDS.SLUG]: dto.slug,
      [WEB_SEO_SCHEMA.FIELDS.TITLE]: dto[titleField], // e.g. 'quizz_name', 'category_name', 'subcategory_name', 'subcategory_level_name'
      ...dto.web_seo,
    };

    Object.entries(TYPE_ID_FIELD_MAPPING).forEach(([typeKey, fieldName]) => {
      const currentType = Number(typeKey);
      if (currentType === type) {
        // Special case for QUIZ_BY_LANGUAGE
        if (type === TypeModeGame.QUIZ_BY_LANGUAGE) {
          webSeoData[fieldName] =
            dto.quiz_mode === QuizMode.QUIZ_BY_LANGUAGE
              ? itemId
              : dto.quiz_by_language_lan_id || null;
        } else {
          webSeoData[fieldName] = itemId;
        }
      } else {
        const dtoField = this.getDtoFieldForType(currentType, dto);
        webSeoData[fieldName] = dtoField || null;
      }
    });

    try {
      const [webSeoID] = await trx(WEB_SEO_SCHEMA.TABLE)
        .insert(webSeoData)
        .returning(WEB_SEO_SCHEMA.FIELDS.ID);
      // if unsuccessful, need to throw error to rollback transaction
      if (!webSeoID) {
        await trx.rollback();
        throw new Error('Failed to create Web SEO entry');
      }
    } catch (error) {
      try {
        await trx.rollback();
      } catch (rollbackError) {
        this.logger.error(
          'Failed to rollback transaction after Web SEO creation failure',
          rollbackError
        );
      }
      throw error;
    }
  }

  /**
   * Update web SEO entry, used when updating existing items like quizzes, categories, etc.
   * @param trx Transaction object
   * @param itemId ID of the item (quiz, category, etc)
   * @param type Type of the item (4 for quiz, etc)
   * @param dto Data transfer object containing SEO information
   * @param titleField Field name to use as title (e.g. 'quizz_name')
   */
  async updateWebSeoEntry(
    trx: Knex.Transaction,
    itemId: number,
    type: TypeModeGame,
    dto: WebSeoBaseDto,
    titleField: string
  ) {
    if (!dto.slug && !dto.web_seo) return;

    const query: any = {
      [WEB_SEO_SCHEMA.FIELDS.TYPE]: type,
    };

    if (isValidWebSeoType(type)) {
      const idField = TYPE_ID_FIELD_MAPPING[type];
      if (idField) {
        query[idField] = itemId;
      }
    }

    const existing = await trx(WEB_SEO_SCHEMA.TABLE).where(query).first();

    if (!existing) {
      // Create new entry if it doesn't exist
      await this.createWebSeoEntry(trx, itemId, type, dto, titleField);
      return;
    }

    const updatedSeo = {
      ...(existing || {}),
      ...dto.web_seo,
      [WEB_SEO_SCHEMA.FIELDS.SLUG]: dto.slug ?? existing?.slug,
      [WEB_SEO_SCHEMA.FIELDS.TITLE]: dto[titleField] ?? existing?.title,
      [WEB_SEO_SCHEMA.FIELDS.LANGUAGE_ID]:
        dto.language_id ?? existing?.language_id,
      [WEB_SEO_SCHEMA.FIELDS.QUIZZ_MODE]: dto.quiz_mode ?? existing?.quizz_mode,
      [WEB_SEO_SCHEMA.FIELDS.TYPE]: type,
    };

    Object.entries(TYPE_ID_FIELD_MAPPING).forEach(([typeKey, fieldName]) => {
      if (Number(typeKey) !== type) {
        const dtoField = this.getDtoFieldForType(Number(typeKey), dto);
        updatedSeo[fieldName] = dtoField ?? existing?.[fieldName] ?? null;
      }
    });

    // Get all web seo record needs to be updated based on ItemId and QuizMode
    const queryUpdate: any = {
      [WEB_SEO_SCHEMA.FIELDS.QUIZZ_MODE]: dto.quiz_mode ?? existing?.quizz_mode,
    };
    if (isValidWebSeoType(type)) {
      const idField = TYPE_ID_FIELD_MAPPING[type];
      if (idField) {
        queryUpdate[idField] = itemId;
      }
    }
    const webSeoRecordsToUpdate = await trx(WEB_SEO_SCHEMA.TABLE)
      .where(queryUpdate)
      .select(WEB_SEO_SCHEMA.FIELDS.ID, WEB_SEO_SCHEMA.FIELDS.TYPE)
      .whereNot(WEB_SEO_SCHEMA.FIELDS.ID, existing.id); // Exclude the current record

    // Base on the web seo records fetched, update the relevant ID fields
    for (const record of webSeoRecordsToUpdate) {
      const recordType = record.type;
      // Get the existing record for this ID
      const existingChild = await trx(WEB_SEO_SCHEMA.TABLE)
        .where(WEB_SEO_SCHEMA.FIELDS.ID, record.id)
        .first();
      if (existingChild) {
        const updateSeoChild = {
          ...(existingChild || {}),
          [WEB_SEO_SCHEMA.FIELDS.LANGUAGE_ID]:
            dto.language_id ?? existingChild?.language_id,
        };

        Object.entries(TYPE_ID_FIELD_MAPPING).forEach(
          ([typeKey, fieldName]) => {
            if (Number(typeKey) !== recordType) {
              const dtoField = this.getDtoFieldForType(Number(typeKey), dto);
              updateSeoChild[fieldName] =
                dtoField ?? existingChild?.[fieldName] ?? null;
            }
          }
        );

        try {
          const affectedChild = await trx(WEB_SEO_SCHEMA.TABLE)
            .where(WEB_SEO_SCHEMA.FIELDS.ID, record.id)
            .update(updateSeoChild);

          if (!affectedChild) {
            await trx.rollback();
            throw new Error('Update Web SEO failed: record not found');
          }
        } catch (e) {
          try {
            await trx.rollback();
          } catch (rollbackError) {
            this.logger.error(
              'Failed to rollback transaction after Web SEO update failure',
              rollbackError
            );
          }
          throw e;
        }
      }
    }

    try {
      const affected = await trx(WEB_SEO_SCHEMA.TABLE)
        .where(query)
        .update(updatedSeo);

      if (!affected) {
        await trx.rollback();
        throw new Error('Update Web SEO failed: record not found');
      }
    } catch (e) {
      try {
        await trx.rollback();
      } catch (rollbackError) {
        this.logger.error(
          'Failed to rollback transaction after Web SEO update failure',
          rollbackError
        );
      }
      throw e;
    }
  }

  /**
   * Delete Web SEO based on specified conditions
   * @param trx - Transaction object
   * @param options - Delete options
   * @param options.type - Type of Web SEO (required)
   * @param options.itemIds - Array of item IDs to delete (optional)
   * @param options.quizModes - Array of quiz modes to filter (optional)
   */
  async deleteWebSEOByItem(
    trx: Knex.Transaction,
    options: {
      type: TypeModeGame;
      itemIds?: number | number[];
      quizModes?: number[];
      childType?: TypeModeGame | TypeModeGame[]; // Optional child type for more specific deletions
    }
  ): Promise<void> {
    try {
      const { type, itemIds, quizModes, childType } = options;

      // Merge type and childType into an array of types to delete
      const typesToDelete = Array.isArray(childType)
        ? [type, ...childType]
        : childType
        ? [type, childType]
        : [type];

      const query = trx(WEB_SEO_SCHEMA.TABLE).whereIn(
        WEB_SEO_SCHEMA.FIELDS.TYPE,
        typesToDelete
      );

      // If quizModes are provided, filter by them
      if (quizModes?.length) {
        query.whereIn(WEB_SEO_SCHEMA.FIELDS.QUIZZ_MODE, quizModes);
      }

      // Add ID field based on type if itemIds is provided
      if (itemIds !== undefined) {
        const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
        if (ids.length === 0) {
          // If itemIds is an empty array, nothing to delete
          return;
        }

        if (isValidWebSeoType(type)) {
          const idField = TYPE_ID_FIELD_MAPPING[type];
          if (idField) {
            query.whereIn(idField, ids);
          }
        }
      }

      await query.delete();
    } catch (error) {
      this.logger.error(
        `Failed to delete Web SEOs | type: ${
          options.type
        } | itemIds: ${JSON.stringify(
          options.itemIds
        )} | quizModes: ${JSON.stringify(options.quizModes)}`,
        error
      );
      throw error;
    }
  }

  private getDtoFieldForType(
    type: TypeModeGame,
    dto: WebSeoBaseDto
  ): number | null {
    switch (type) {
      case TypeModeGame.QUIZ:
        return dto.quiz_id || null;
      case TypeModeGame.CATEGORY:
        return dto.maincat_id || null;
      case TypeModeGame.SUBCATEGORY:
        return dto.main_subcat_id || null;
      case TypeModeGame.SUBCATEGORY_LEVEL:
        return dto.main_subcat_level_id || null;
      case TypeModeGame.QUIZ_BY_LANGUAGE:
        return dto.quiz_by_language_lan_id || null;
      default:
        return null;
    }
  }
}
