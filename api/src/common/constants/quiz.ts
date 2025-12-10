export enum QuizSortBy {
  ID = 'id',
  LANGUAGE = 'language_id',
  CATEGORY = 'maincat_id',
  SUB_CATEGORY = 'main_subcat_id',
  SUB_CATEGORY_LEVEL = 'main_subcat_level_id',
  QUIZ_NAME = 'quizz_name',
  STATUS = 'status',
  IS_FEATURED = 'is_featured',
  IS_COMING_SOON = 'is_coming_soon',
  IS_PINNED = 'is_pinned',
}

export const MAX_RELATED_QUIZZES = 5;

export const COMPLETED_QUIZ_HQ_MIN_PERCENTAGE = 75;
