import { WEB_SEO_SCHEMA } from './../core/database/schemas/web-seo.schema';

export function getWebSeoJsonObjectSql(): string {
  const t = WEB_SEO_SCHEMA.TABLE;
  const f = WEB_SEO_SCHEMA.FIELDS;

  return `
    CAST(JSON_OBJECT(
      'id', ${t}.${f.ID},
      'language_id', ${t}.${f.LANGUAGE_ID},
      'quizz_mode', ${t}.${f.QUIZZ_MODE},
      'type', ${t}.${f.TYPE},
      'quizz_by_language_lan_id', ${t}.${f.QUIZZ_BY_LANGUAGE_LAN_ID},
      'maincat_id', ${t}.${f.MAINCAT_ID},
      'subcategory_id', ${t}.${f.SUBCATEGORY_ID},
      'subcategory_level_id', ${t}.${f.SUBCATEGORY_LEVEL_ID},
      'quizz_id', ${t}.${f.QUIZZ_ID},
      'title', ${t}.${f.TITLE},
      'sub_heading', ${t}.${f.SUB_HEADING},
      'slug', ${t}.${f.SLUG},
      'seo_block', ${t}.${f.SEO_BLOCK},
      'meta_title', ${t}.${f.META_TITLE},
      'meta_description', ${t}.${f.META_DESCRIPTION},
      'meta_keyword', ${t}.${f.META_KEYWORD},
      'schema_markup', ${t}.${f.SCHEMA_MARKUP},
      'sponsor_link', ${t}.${f.SPONSOR_LINK},
      'sponsor_name', ${t}.${f.SPONSOR_NAME},
      'description', ${t}.${f.DESCRIPTION},
      'is_edit_slug', ${t}.${f.IS_EDIT_SLUG},
      'sub_title', ${t}.${f.SUB_TITLE},
      'heading', ${t}.${f.HEADING},
      'enable_faq', ${t}.${f.ENABLE_FAQ}
    ) AS CHAR) AS web_seo
  `.trim();
}
