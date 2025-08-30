export const GUESS_THE_WORD_SCHEMA = {
  TABLE: 'tbl_guess_the_word',
  FIELDS: {
    ID: 'id',
    LANGUAGE_ID: 'language_id',
    CATEGORY: 'category',
    SUBCATEGORY: 'subcategory',
    IMAGE: 'image',
    QUESTION: 'question',
    ANSWER: 'answer',
    ENABLE_FAQ: 'enable_faq', // 0 = no, 1 = yes
    LEVEL: 'level',
    NOTE: 'note',
  },
} as const;
