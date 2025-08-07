export const BASE_URL = process.env.BASE_URL ?? 'https://admin.mastersoftrivia.com/';

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

export const SUBCATEGORY_LEVEL_THUMB_PATH = 'images/subcategory-level/thumbs/100x100/';

export const SUBCATEGORY_LEVEL_THUMB_PATH_SMALL = 'images/subcategory-level/thumbs/50x50/';

export const QUIZZES_IMAGE_PATH = 'images/quizzes/';

export const QUIZZES_THUMB_PATH = 'images/quizzes/thumbs/100x100/';

export const QUIZZES_THUMB_PATH_SMALL = 'images/quizzes/thumbs/50x50/';

export const SECRET_KEY_ANSWER = 'DpXYfbXorUGtJSswckSN9dADvkPkWZPk'; // from legacy code

export const CACHE_TTL_DEFAULT = 1 * 60 * 60 // 1 hour

export enum OrderBy {
  ASC = 'asc',
  DESC = 'desc',
}