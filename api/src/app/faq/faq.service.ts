import { Injectable, Logger } from '@nestjs/common';
import {
  FAQ_SCHEMA,
  CATEGORY_SCHEMA,
  SUBCATEGORY_SCHEMA,
  SUBCATEGORY_LEVEL_SCHEMA,
  QUIZZ_SCHEMA,
} from '../../core/database/schemas';
import { Knex } from 'knex';
import { TypeModeGame, QuizMode } from '../../common/constants/app';
import { FaqBaseDto } from './interface/faq.interface';

const FAQ_TYPE_ID_FIELD_MAPPING = {
  [TypeModeGame.QUIZ]: FAQ_SCHEMA.FIELDS.QUIZZ_ID,
  [TypeModeGame.CATEGORY]: FAQ_SCHEMA.FIELDS.MAINCAT_ID,
  [TypeModeGame.SUBCATEGORY]: FAQ_SCHEMA.FIELDS.SUBCATEGORY_ID,
  [TypeModeGame.SUBCATEGORY_LEVEL]: FAQ_SCHEMA.FIELDS.SUBCATEGORY_LEVEL_ID,
  [TypeModeGame.QUIZ_BY_LANGUAGE]: FAQ_SCHEMA.FIELDS.QUIZZ_BY_LANGUAGE_LAN_ID,
} as const;

// Define valid types based on the mapping keys
type ValidFaqType = keyof typeof FAQ_TYPE_ID_FIELD_MAPPING;

// Check if type exists in mapping
function isValidFaqType(type: TypeModeGame): type is ValidFaqType {
  return type in FAQ_TYPE_ID_FIELD_MAPPING;
}

const FAQ_TYPE_ID_ITEM_TABLE_MAPPING = {
  [TypeModeGame.QUIZ]: QUIZZ_SCHEMA.TABLE,
  [TypeModeGame.CATEGORY]: CATEGORY_SCHEMA.TABLE,
  [TypeModeGame.SUBCATEGORY]: SUBCATEGORY_SCHEMA.TABLE,
  [TypeModeGame.SUBCATEGORY_LEVEL]: SUBCATEGORY_LEVEL_SCHEMA.TABLE,
} as const;

type ValidFaqItemTableType = keyof typeof FAQ_TYPE_ID_ITEM_TABLE_MAPPING;

function isValidFaqItemTableType(
  type: TypeModeGame
): type is ValidFaqItemTableType {
  return type in FAQ_TYPE_ID_ITEM_TABLE_MAPPING;
}

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  /**
   * Create FAQ entries for an item
   */
  async createFaqEntries(
    trx: Knex.Transaction,
    itemId: number, // ID of the item (quiz, subcategory level, subcategory, category, etc.)
    type: TypeModeGame,
    dto: FaqBaseDto
  ) {
    try {
      if (!dto.enable_faq || !dto.questions?.length || !dto.answers?.length) {
        return;
      }

      type FaqRow = Record<string, string | number | null>;
      const questions = dto.questions.filter((q: string) => q && q.trim());
      const answers = dto.answers.filter((a: string) => a && a.trim());

      const faqData: FaqRow[] = questions
        .map((question: string, index: number): FaqRow | null => {
          const answer = answers[index];
          if (!question || !answer) return null;

          const data: FaqRow = {
            [FAQ_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id,
            [FAQ_SCHEMA.FIELDS.QUIZZ_MODE]: dto.quiz_mode,
            [FAQ_SCHEMA.FIELDS.TYPE]: type,
            [FAQ_SCHEMA.FIELDS.QUESTION]: question.trim(),
            [FAQ_SCHEMA.FIELDS.ANSWER]: answer.trim(),
            [FAQ_SCHEMA.FIELDS.SEO_BLOCK]: '',
            [FAQ_SCHEMA.FIELDS.NOTE]: '',
            [FAQ_SCHEMA.FIELDS.DESCRIPTION]: '',
            [FAQ_SCHEMA.FIELDS.ENABLE_FAQ]: dto.enable_faq ? 1 : 0,
          };

          Object.entries(FAQ_TYPE_ID_FIELD_MAPPING).forEach(
            ([typeKey, fieldName]) => {
              const currentType = Number(typeKey);
              if (currentType === type) {
                // Special case for QUIZ_BY_LANGUAGE
                if (type === TypeModeGame.QUIZ_BY_LANGUAGE) {
                  data[fieldName] =
                    dto.quiz_mode === QuizMode.QUIZ_BY_LANGUAGE
                      ? itemId
                      : dto.quiz_by_language_lan_id || null;
                } else {
                  data[fieldName] = itemId;
                }
              } else {
                const dtoField = this.getDtoFieldForType(currentType, dto);
                data[fieldName] = dtoField || null;
              }
            }
          );

          return data;
        })
        .filter(Boolean);

      if (faqData.length) {
        await trx(FAQ_SCHEMA.TABLE).insert(faqData);
      }
    } catch (error) {
      this.logger.error(
        `Failed to create FAQ entries for ${type}:${itemId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Update FAQ entries for an item
   */
  async updateFaqEntries(
    trx: Knex.Transaction,
    itemId: number,
    type: TypeModeGame,
    dto: FaqBaseDto
  ) {
    try {
      // Get existing item's details
      if (!isValidFaqItemTableType(type)) {
        throw new Error(`Invalid type for FAQ item table: ${type}`);
      }
      const itemTable = FAQ_TYPE_ID_ITEM_TABLE_MAPPING[type];
      const existingItem = await trx(itemTable).where('id', itemId).first();
      if (!existingItem) {
        throw new Error(
          `Item not found for FAQ update: ${type} with ID ${itemId}`
        );
      }

      const { edit_faq_ids = [], questions = [], answers = [] } = dto;
      const faqIdList = edit_faq_ids.map((id: number) => Number(id));

      // Get all existing FAQs for this item
      const query: any = {
        [FAQ_SCHEMA.FIELDS.TYPE]: type,
      };

      if (isValidFaqType(type)) {
        const idField = FAQ_TYPE_ID_FIELD_MAPPING[type];
        if (idField) {
          query[idField] = itemId;
        }
      }

      const allFaqInDb = await trx(FAQ_SCHEMA.TABLE)
        .where(query)
        .select(`${FAQ_SCHEMA.FIELDS.ID}`);

      // Delete FAQs not in edit_faq_ids
      const idsToDelete = allFaqInDb
        .filter((faq) => !faqIdList.includes(faq.id))
        .map((faq) => faq.id);

      if (idsToDelete.length > 0) {
        await trx(FAQ_SCHEMA.TABLE)
          .whereIn(`${FAQ_SCHEMA.FIELDS.ID}`, idsToDelete)
          .delete();
      }

      const cleanQuestions = questions.filter((q: string) => q && q.trim());
      const cleanAnswers = answers.filter((a: string) => a && a.trim());

      // Prepare ID field updates for all types
      const idFieldUpdates: Record<string, number | null> = {};
      Object.entries(FAQ_TYPE_ID_FIELD_MAPPING).forEach(
        ([typeKey, fieldName]) => {
          const currentType = Number(typeKey);
          if (currentType === type) {
            // Special case for QUIZ_BY_LANGUAGE
            if (type === TypeModeGame.QUIZ_BY_LANGUAGE) {
              idFieldUpdates[fieldName] =
                dto.quiz_mode === QuizMode.QUIZ_BY_LANGUAGE
                  ? itemId
                  : dto.quiz_by_language_lan_id || null;
            } else {
              idFieldUpdates[fieldName] = itemId;
            }
          } else {
            const dtoField = this.getDtoFieldForType(
              currentType,
              dto,
              existingItem
            );
            idFieldUpdates[fieldName] = dtoField || null;
          }
        }
      );

      // If no questions/answers provided, just update IDs and return
      if (cleanQuestions.length === 0 && cleanAnswers.length === 0) {
        const remainingIds = (
          faqIdList.length > 0 ? faqIdList : allFaqInDb.map((f) => f.id)
        ).filter((id) => !idsToDelete.includes(id));

        if (remainingIds.length > 0) {
          await trx(FAQ_SCHEMA.TABLE)
            .whereIn(FAQ_SCHEMA.FIELDS.ID, remainingIds)
            .update(idFieldUpdates);
        }
        return; // Nothing more to do
      }

      // Get all child FAQs need tobe update based on ItemId and QuizMode
      const quizMode =
        dto.quiz_mode !== undefined && dto.quiz_mode !== null
          ? dto.quiz_mode
          : null;
      console.log('dto', dto);
      const excludeIds = (faqIdList ?? [])
        .map(Number)
        .filter((n) => Number.isFinite(n));

      const queryUpdate: any = {
        [FAQ_SCHEMA.FIELDS.QUIZZ_MODE]: quizMode,
      };

      if (isValidFaqType(type)) {
        const idField = FAQ_TYPE_ID_FIELD_MAPPING[type];
        if (idField) {
          queryUpdate[idField] = itemId;
        }
      }
      const faqRecordsToUpdate = await trx(FAQ_SCHEMA.TABLE)
        .where(queryUpdate)
        .modify(
          (q) =>
            faqIdList?.length && q.whereNotIn(FAQ_SCHEMA.FIELDS.ID, faqIdList)
        )
        .select(FAQ_SCHEMA.FIELDS.ID, FAQ_SCHEMA.FIELDS.TYPE);

      for (const record of faqRecordsToUpdate) {
        const recordType = record.type;
        // Prepare ID field updates for all types
        const existingChild = await trx(FAQ_SCHEMA.TABLE)
          .where(FAQ_SCHEMA.FIELDS.ID, record.id)
          .first();
        if (!existingChild) continue;
        const idFieldUpdatesForChilds: Record<string, number | null> = {};
        Object.entries(FAQ_TYPE_ID_FIELD_MAPPING).forEach(
          ([typeKey, fieldName]) => {
            const currentType = Number(typeKey);
            if (currentType !== recordType) {
              const dtoField = this.getDtoFieldForType(
                currentType,
                dto,
                existingChild
              );
              idFieldUpdatesForChilds[fieldName] =
                dtoField ?? existingChild?.[fieldName] ?? null;
            }
          }
        );

        // log to check
        console.log('Updating FAQ ID:', record.id, idFieldUpdatesForChilds);
        await trx(FAQ_SCHEMA.TABLE)
          .where(FAQ_SCHEMA.FIELDS.ID, record.id)
          .update(idFieldUpdatesForChilds);
      }

      type FaqRow = Record<string, string | number | null>;
      const faqArray: FaqRow[] = cleanQuestions
        .map((question: string, index: number): FaqRow | null => {
          const answer = cleanAnswers[index];
          if (!question || !answer) return null;

          const data: FaqRow = {
            [FAQ_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id,
            [FAQ_SCHEMA.FIELDS.QUIZZ_MODE]: dto.quiz_mode,
            [FAQ_SCHEMA.FIELDS.TYPE]: type,
            [FAQ_SCHEMA.FIELDS.QUESTION]: question.trim(),
            [FAQ_SCHEMA.FIELDS.ANSWER]: answer.trim(),
            [FAQ_SCHEMA.FIELDS.SEO_BLOCK]: '',
            [FAQ_SCHEMA.FIELDS.NOTE]: '',
            [FAQ_SCHEMA.FIELDS.DESCRIPTION]: '',
            [FAQ_SCHEMA.FIELDS.ENABLE_FAQ]: dto.enable_faq ? 1 : 0,
          };

          Object.entries(FAQ_TYPE_ID_FIELD_MAPPING).forEach(
            ([typeKey, fieldName]) => {
              const currentType = Number(typeKey);
              if (currentType === type) {
                // Special case for QUIZ_BY_LANGUAGE
                if (type === TypeModeGame.QUIZ_BY_LANGUAGE) {
                  data[fieldName] =
                    dto.quiz_mode === QuizMode.QUIZ_BY_LANGUAGE
                      ? itemId
                      : dto.quiz_by_language_lan_id || null;
                } else {
                  data[fieldName] = itemId;
                }
              } else {
                const dtoField = this.getDtoFieldForType(
                  currentType,
                  dto,
                  existingItem
                );
                data[fieldName] = dtoField || null;
              }
            }
          );

          return data;
        })
        .filter(Boolean);

      if (faqArray.length === 0) return;

      // Insert/update following the edit_faq_ids order
      const faqCount = faqArray.length;
      const idCount = edit_faq_ids.length;

      for (let i = 0; i < faqCount; i++) {
        const faqData = faqArray[i];

        if (i < idCount) {
          const faqId = edit_faq_ids[i];
          await trx(FAQ_SCHEMA.TABLE)
            .where(`${FAQ_SCHEMA.FIELDS.ID}`, faqId)
            .update(faqData);
        } else {
          await trx(FAQ_SCHEMA.TABLE).insert(faqData);
        }
      }
    } catch (error) {
      this.logger.error(
        `Failed to update FAQ entries for ${type}:${itemId}`,
        error
      );
      throw error;
    }
  }

  /**
   * Delete FAQs based on specified conditions
   * @param trx - Transaction object
   * @param options - Delete options
   * @param options.type - Type of FAQ (required)
   * @param options.itemIds - Array of item IDs to delete (optional)
   * @param options.quizModes - Array of quiz modes to filter (optional)
   */
  async deleteFaqsByItem(
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
      // Merge childType into type if provided
      const typesToDelete = Array.isArray(childType)
        ? [type, ...childType]
        : childType
        ? [type, childType]
        : [type];

      const query = trx(FAQ_SCHEMA.TABLE).whereIn(
        FAQ_SCHEMA.FIELDS.TYPE,
        typesToDelete
      );

      // If quizModes are provided, filter by them
      if (quizModes?.length) {
        query.whereIn(FAQ_SCHEMA.FIELDS.QUIZZ_MODE, quizModes);
      }

      // Add ID field based on type if itemIds is provided
      if (itemIds) {
        const ids = Array.isArray(itemIds) ? itemIds : [itemIds];
        if (ids.length === 0) {
          // If itemIds is an empty array, nothing to delete
          return;
        }

        if (isValidFaqType(type)) {
          const idField = FAQ_TYPE_ID_FIELD_MAPPING[type];
          if (idField) {
            query.whereIn(idField, ids);
          }
        }
      }

      const affected = await query.delete();
      return affected;
    } catch (error) {
      this.logger.error(
        `Failed to delete FAQs | type: ${
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
    dto: FaqBaseDto,
    existingItem?: FaqBaseDto
  ): number | null {
    switch (type) {
      case TypeModeGame.QUIZ:
        return dto.quizz_id || existingItem?.quizz_id || null;
      case TypeModeGame.CATEGORY:
        return dto.maincat_id || existingItem?.maincat_id || null;
      case TypeModeGame.SUBCATEGORY:
        return dto.main_subcat_id || existingItem?.main_subcat_id || null;
      case TypeModeGame.SUBCATEGORY_LEVEL:
        return (
          dto.main_subcat_level_id || existingItem?.main_subcat_level_id || null
        );
      case TypeModeGame.QUIZ_BY_LANGUAGE:
        return (
          dto.quiz_by_language_lan_id ||
          existingItem?.quiz_by_language_lan_id ||
          null
        );
      default:
        return null;
    }
  }
}
