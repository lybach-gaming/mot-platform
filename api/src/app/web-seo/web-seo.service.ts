import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { WEB_SEO_SCHEMA } from '../../core/database/schemas';
import { getWebSeoJsonObjectSql } from '../../utils/web-seo-json-object';

@Injectable()
export class WebSeoService {
  constructor(private readonly dbService: DatabaseService) {}

  /**
   * Get web SEO select query for reuse across services
   */
  getWebSeoSelectQuery() {
    const sql = getWebSeoJsonObjectSql();
    return this.dbService.connection.raw(sql);
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
