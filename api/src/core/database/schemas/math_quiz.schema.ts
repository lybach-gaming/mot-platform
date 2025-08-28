export const MATH_QUIZ_SCHEMA = {
  TABLE: 'tbl_math_quizz',
  FIELDS: {
    ID: 'id',
    LANGUAGE_ID: 'language_id',
    MAINCAT_ID: 'maincat_id',
    QUIZZ_NAME: 'quizz_name',
    IMAGE: 'image',
    STATUS: 'status', // 1=Active, 0=Deactivate
    IS_PREMIUM: 'is_premium', // 0 = no, 1 = yes
    COINS: 'coins',
    ROW_ORDER: 'row_order',
    SLUG: 'slug',
    ENABLE_FAQ: 'enable_faq', // 0 = no, 1 = yes
    LEVEL: 'level',
  },
} as const;
