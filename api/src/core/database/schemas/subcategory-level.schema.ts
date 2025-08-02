export const SUBCATEGORY_LEVEL_SCHEMA = {
  TABLE: 'tbl_subcategory_level',
  FIELDS: {
    ID: 'id',
    LANGUAGE_ID: 'language_id',
    MAINCAT_ID: 'maincat_id',
    MAIN_SUBCAT_ID: 'main_subcat_id',
    NAME: 'subcategory_level_name',
    IMAGE: 'image',
    STATUS: 'status',
    IS_PREMIUM: 'is_premium',
    COINS: 'coins',
    ROW_ORDER: 'row_order',
    SLUG: 'slug',
    ENABLE_FAQ: 'enable_faq',
    LEVEL: 'level',
    IS_COMING_SOON: 'is_coming_soon',
  },
} as const;
