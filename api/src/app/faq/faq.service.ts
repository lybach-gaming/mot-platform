import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { FAQ_SCHEMA } from '../../core/database/schemas';
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

@Injectable()
export class FaqService {
  private readonly logger = new Logger(FaqService.name);

  constructor(private readonly dbService: DatabaseService) {}

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

      const questions = dto.questions.filter((q) => q && q.trim());
      const answers = dto.answers.filter((a) => a && a.trim());

      const faqData = questions
        .map((question, index) => {
          const answer = answers[index];
          if (!question || !answer) return null;

          const data = {
            [FAQ_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id,
            [FAQ_SCHEMA.FIELDS.QUIZZ_MODE]: dto.quiz_mode,
            [FAQ_SCHEMA.FIELDS.TYPE]: type,
            [FAQ_SCHEMA.FIELDS.QUESTION]: question.trim(),
            [FAQ_SCHEMA.FIELDS.ANSWER]: answer.trim(),
            [FAQ_SCHEMA.FIELDS.SEO_BLOCK]: dto.seo_block || '',
            [FAQ_SCHEMA.FIELDS.NOTE]: dto.note || '',
            [FAQ_SCHEMA.FIELDS.DESCRIPTION]: dto.description || '',
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
      const { edit_faq_ids = [], questions = [], answers = [] } = dto;
      const faqIdList = edit_faq_ids.map((id) => Number(id));

      // Get all existing FAQs for this item
      const query: any = {
        [FAQ_SCHEMA.FIELDS.TYPE]: type,
      };

      const idField = FAQ_TYPE_ID_FIELD_MAPPING[type];
      if (idField) {
        query[idField] = itemId;
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

      const cleanQuestions = questions.filter((q) => q && q.trim());
      const cleanAnswers = answers.filter((a) => a && a.trim());

      const faqArray = cleanQuestions
        .map((question, index) => {
          const answer = cleanAnswers[index];
          if (!question || !answer) return null;

          const data = {
            [FAQ_SCHEMA.FIELDS.LANGUAGE_ID]: dto.language_id,
            [FAQ_SCHEMA.FIELDS.QUIZZ_MODE]: dto.quiz_mode,
            [FAQ_SCHEMA.FIELDS.TYPE]: type,
            [FAQ_SCHEMA.FIELDS.QUESTION]: question.trim(),
            [FAQ_SCHEMA.FIELDS.ANSWER]: answer.trim(),
            [FAQ_SCHEMA.FIELDS.SEO_BLOCK]: dto.seo_block || '',
            [FAQ_SCHEMA.FIELDS.NOTE]: dto.note || '',
            [FAQ_SCHEMA.FIELDS.DESCRIPTION]: dto.description || '',
            [FAQ_SCHEMA.FIELDS.ENABLE_FAQ]: dto.enable_faq ? 1 : 0,
          };

          Object.entries(FAQ_TYPE_ID_FIELD_MAPPING).forEach(
            ([typeKey, fieldName]) => {
              if (Number(typeKey) !== type) {
                const dtoField = this.getDtoFieldForType(Number(typeKey), dto);
                data[fieldName] = dtoField ?? existing?.[fieldName] ?? null;
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
    }
  ): Promise<void> {
    try {
      const { type, itemIds, quizModes } = options;
      let query = trx(FAQ_SCHEMA.TABLE).where(FAQ_SCHEMA.FIELDS.TYPE, type);

      // If quizModes are provided, filter by them
      if (quizModes?.length) {
        query = query.whereIn(FAQ_SCHEMA.FIELDS.QUIZZ_MODE, quizModes);
      }

      // Add ID field based on type if itemIds is provided
      if (itemIds) {
        const ids = Array.isArray(itemIds) ? itemIds : [itemIds];

        const idField = FAQ_TYPE_ID_FIELD_MAPPING[type];
        if (idField) {
          query = query.whereIn(idField, ids);
        }
      }

      await trx(FAQ_SCHEMA.TABLE).where(query).delete();
    } catch (error) {
      this.logger.error(`Failed to delete FAQs for ${type}:${itemId}`, error);
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
