export const FUN_N_LEARN_STORY_SCHEMA = {
  TABLE: 'tbl_fun_n_learn_story',
  FIELDS: {
    ID: 'id',
    LANGUAGE_ID: 'language_id',
    CATEGORY: 'category',
    SUBCATEGORY: 'subcategory',
    IMAGE: 'image',
    TITLE: 'title',
    DESCRIPTION: 'description',
    NOTE: 'note',
    DETAIL: 'detail',
    STATUS: 'status',
    ENABLE_STORY: 'enable_story', // 0 = no, 1 = yes
  },
} as const;
