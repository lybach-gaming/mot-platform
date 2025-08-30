export const FUN_N_LEARN_SCHEMA = {
  TABLE: 'tbl_fun_n_learn',
  FIELDS: {
    ID: 'id',
    LANGUAGE_ID: 'language_id',
    CATEGORY: 'category',
    SUBCATEGORY: 'subcategory',
    TITLE: 'title',
    DETAIL: 'detail',
    STATUS: 'status', // 1=active, 0=inactive
    ENABLE_FAQ: 'enable_faq', // 1=yes, 0=no
  },
} as const;
