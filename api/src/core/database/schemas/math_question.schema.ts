export const MATH_QUESTION_SCHEMA = {
  TABLE: 'tbl_maths_question',
  FIELDS: {
    ID: 'id',
    CATEGORY: 'category',
    SUBCATEGORY: 'subcategory',
    QUIZ_ID: 'quiz_id',
    LANGUAGE_ID: 'language_id',
    IMAGE: 'image',
    QUESTION: 'question',
    QUESTION_TYPE: 'question_type', // 1=normal, 2=true/false
    OPTION_A: 'optiona',
    OPTION_B: 'optionb',
    OPTION_C: 'optionc',
    OPTION_D: 'optiond',
    OPTION_E: 'optione',
    ANSWER: 'answer',
    NOTE: 'note',
  },
} as const;
