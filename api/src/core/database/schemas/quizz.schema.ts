export const QUIZZ_SCHEMA = {
  TABLE: 'tbl_quizz',
  FIELDS: {
    ID: 'id',
    LANGUAGE_ID: 'language_id',
    MAINCAT_ID: 'maincat_id',
    MAIN_SUBCAT_ID: 'main_subcat_id',
    MAIN_SUBCAT_LEVEL_ID: 'main_subcat_level_id',
    QUIZZ_NAME: 'quizz_name',
    IMAGE: 'image',
    STATUS: 'status',
    IS_PREMIUM: 'is_premium',
    COINS: 'coins',
    ROW_ORDER: 'row_order',
    SLUG: 'slug',
    ENABLE_FAQ: 'enable_faq',
    IS_PUBLIC: 'is_public',
    LEVEL: 'level',
    IS_FEATURED: 'is_featured',
    IS_COMING_SOON: 'is_coming_soon',
    IS_PINNED: 'is_pinned',
  },
};

export interface IQuizz {
  id: number;
  language_id: number;
  maincat_id: number;
  main_subcat_id: number;
  main_subcat_level_id: number;
  quizz_name: string;
  image: string | null;
  status: number;
  is_premium: boolean;
  coins: number;
  row_order: number;
  slug: string;
  enable_faq: boolean;
  is_public: boolean;
  level: number;
  is_featured: boolean;
  is_coming_soon: boolean;
  is_pinned: boolean;
}
