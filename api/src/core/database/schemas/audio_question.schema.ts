export const AUDIO_QUESTION_SCHEMA = {
  TABLE: 'tbl_audio_question',
  FIELDS: {
    ID: 'id',
    CATEGORY: 'category',
    SUBCATEGORY: 'subcategory',
    LANGUAGE_ID: 'language_id',
    AUDIO_TYPE: 'audio_type', // 1=link, 2=upload
    AUDIO: 'audio',
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
