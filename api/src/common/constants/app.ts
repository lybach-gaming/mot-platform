export const BASE_URL =
  process.env.BASE_URL ?? 'https://admin.mastersoftrivia.com/';

export const FE_URL = process.env.FE_URL ?? 'https://mastersoftrivia.com/';

export const USER_IMG_PATH = 'images/profile/';

export const QUESTION_IMG_PATH = 'images/questions/';

export const WEB_SETTINGS_LOGO_PATH = 'images/web-settings/';

export const WEB_HOME_SETTINGS_LOGO_PATH = 'images/web-home-settings/';

export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

export const QUIZ_HQ_SLUG = 'all-quizzes';

export const CATEGORY_IMAGE_PATH = 'images/category/';

export const CATEGORY_THUMB_PATH = 'images/category/thumbs/100x100/';

export const CATEGORY_THUMB_PATH_SMALL = 'images/category/thumbs/50x50/';

export const SUBCATEGORY_IMAGE_PATH = 'images/subcategory/';

export const SUBCATEGORY_THUMB_PATH = 'images/subcategory/thumbs/100x100/';

export const SUBCATEGORY_THUMB_PATH_SMALL = 'images/subcategory/thumbs/50x50/';

export const SUBCATEGORY_LEVEL_IMAGE_PATH = 'images/subcategory-level/';

export const SUBCATEGORY_LEVEL_THUMB_PATH =
  'images/subcategory-level/thumbs/100x100/';

export const SUBCATEGORY_LEVEL_THUMB_PATH_SMALL =
  'images/subcategory-level/thumbs/50x50/';

export const QUIZZES_IMAGE_PATH = 'images/quizzes/';

export const QUIZZES_THUMB_PATH = 'images/quizzes/thumbs/100x100/';

export const QUIZZES_THUMB_PATH_SMALL = 'images/quizzes/thumbs/50x50/';

export const FUN_N_LEARN_IMAGE_PATH = 'images/fun-n-learn/';

export const GUESS_THE_WORD_IMAGE_PATH = 'images/guess-the-word/';

export const MATH_MANIA_IMAGE_PATH = 'images/math-mania/';

export const AUDIO_QUESTION_PATH = 'audio/audio-questions/';

export const SECRET_KEY_ANSWER = 'DpXYfbXorUGtJSswckSN9dADvkPkWZPk'; // from legacy code

export const CACHE_TTL_DEFAULT = 1 * 60 * 60; // 1 hour

export enum OrderBy {
  ASC = 'asc',
  DESC = 'desc',
}

// Enum for type modes in game (using for FAQs and Web Seo)
export enum TypeModeGame {
  QUIZ_BY_LANGUAGE = 6,
  COMMON = 5,
  QUIZ = 4,
  SUBCATEGORY_LEVEL = 3,
  SUBCATEGORY = 2,
  CATEGORY = 1,
  ALL = 0,
}

// Enum for quiz modes (using for FAQs and Web Seo)
export enum QuizMode {
  QUIZ_HQ = 1,
  FUND_N_LEARN = 2,
  GUESS_THE_WORD = 3,
  AUDIO_QUESTION = 4,
  MATH_MANIA = 5,
  TRUE_FALSE = 6,
  DAILY_QUIZZ = 7,
  CONTEST = 8,
  EXAM = 9,
  BATTLE_1X1 = 10,
  BATTLE_GROUP = 11,
  QUIZ_BY_LANGUAGE = 12,
  COMMON_PAGE = 15,
}

export const LANG_ENGLISH_ID = 14;
