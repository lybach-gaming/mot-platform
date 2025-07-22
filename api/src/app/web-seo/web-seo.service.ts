import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { WEB_SEO_SCHEMA } from '../../core/database/schemas';

@Injectable()
export class WebSeoService {
  constructor(private readonly dbService: DatabaseService) {}

  /**
   * Get web SEO select query for reuse across services
   */
  getWebSeoSelectQuery() {
    return this.dbService.connection.raw(`
      CAST(JSON_OBJECT(
        'id', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.ID},
        'language_id', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.LANGUAGE_ID},
        'quizz_mode', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.QUIZZ_MODE},
        'type', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.TYPE},
        'quizz_by_language_lan_id', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.QUIZZ_BY_LANGUAGE_LAN_ID},
        'maincat_id', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.MAINCAT_ID},
        'subcategory_id', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.SUBCATEGORY_ID},
        'subcategory_level_id', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.SUBCATEGORY_LEVEL_ID},
        'quizz_id', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.QUIZZ_ID},
        'title', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.TITLE},
        'sub_heading', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.SUB_HEADING},
        'slug', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.SLUG},
        'seo_block', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.SEO_BLOCK},
        'meta_title', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.META_TITLE},
        'meta_description', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.META_DESCRIPTION},
        'meta_keyword', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.META_KEYWORD},
        'schema_markup', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.SCHEMA_MARKUP},
        'sponsor_link', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.SPONSOR_LINK},
        'sponsor_name', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.SPONSOR_NAME},
        'description', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.DESCRIPTION},
        'is_edit_slug', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.IS_EDIT_SLUG},
        'sub_title', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.SUB_TITLE},
        'heading', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.HEADING},
        'enable_faq', ${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.ENABLE_FAQ}
      ) AS CHAR) as web_seo
    `);
  }

  /**
   * Add web SEO join to query builder
   */
  addWebSeoJoin(query: any, slugField: string) {
    return query.leftJoin(
      WEB_SEO_SCHEMA.TABLE,
      `${WEB_SEO_SCHEMA.TABLE}.${WEB_SEO_SCHEMA.FIELDS.SLUG}`,
      slugField
    );
  }
}
