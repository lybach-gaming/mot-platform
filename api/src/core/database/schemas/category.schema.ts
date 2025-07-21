export const CATEGORY_SCHEMA = {
  TABLE: 'tbl_category',
  FIELDS: {
    ID: 'id',
    LANGUAGE_ID: 'language_id',
    NAME: 'category_name',
    TYPE: 'type',
    IS_PREMIUM: 'is_premium',
    COINS: 'coins',
    IMAGE: 'image',
    ROW_ORDER: 'row_order',
    SLUG: 'slug',
    ENABLE_FAQ: 'enable_faq',
    LEVEL: 'level',
    IS_COMING_SOON: 'is_coming_soon',
  },
} as const;
