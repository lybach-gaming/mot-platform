import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import {
  WEB_SEO_SCHEMA,
  BLOG_SCHEMA,
  BLOG_CATEGORY_SCHEMA,
} from '../../core/database/schemas';
import { isValidSlug, toSlug } from '../../common/utils/slug.util';

type TableScope = { table: string; idField: string; slugField: string };

const SCOPES: TableScope[] = [
  {
    table: WEB_SEO_SCHEMA.TABLE,
    idField: WEB_SEO_SCHEMA.FIELDS.ID,
    slugField: WEB_SEO_SCHEMA.FIELDS.SLUG,
  },
  {
    table: BLOG_CATEGORY_SCHEMA.TABLE,
    idField: BLOG_CATEGORY_SCHEMA.FIELDS.ID,
    slugField: BLOG_CATEGORY_SCHEMA.FIELDS.SLUG,
  },
  {
    table: BLOG_SCHEMA.TABLE,
    idField: BLOG_SCHEMA.FIELDS.ID,
    slugField: BLOG_SCHEMA.FIELDS.SLUG,
  },
];

@Injectable()
export class HelpersService {
  private readonly INVALID_CHARS_REGEX = new RegExp(
    '[@#$%^&+=`,<>?{}[\\]|\\\\]'
  );

  constructor(private readonly db: DatabaseService) {}

  /** Validate slug format */
  assertValid(slug: string): void {
    if (!slug || typeof slug !== 'string') {
      throw new BadRequestException('Slug must be a non-empty string');
    }

    // Check invalid characters
    if (this.INVALID_CHARS_REGEX.test(slug)) {
      throw new BadRequestException('Slug contains invalid characters');
    }

    // Check forward slash
    if (slug.includes('/')) {
      throw new BadRequestException('Slug cannot contain forward slash');
    }

    // Check ASCII conversion
    const convertedSlug = toSlug(slug);
    if (slug !== convertedSlug) {
      throw new BadRequestException('Slug must contain only ASCII characters');
    }

    // Check valid slug format
    if (!isValidSlug(slug)) {
      throw new BadRequestException('Invalid slug format');
    }
  }

  /** Check if slug exists in a specific scope */
  async exists(
    scope: TableScope,
    slug: string,
    excludeId?: number
  ): Promise<boolean> {
    const query = this.db.connection(scope.table).where(scope.slugField, slug);

    if (excludeId) {
      query.andWhereNot(scope.idField, excludeId);
    }

    return !!(await query.first());
  }

  /** Check if slug exists in any scope */
  async existsGlobal(slug: string, excludeId?: number): Promise<boolean> {
    for (const scope of SCOPES) {
      if (await this.exists(scope, slug, excludeId)) {
        return true;
      }
    }
    return false;
  }

  /** Check if slug is unique in specific scope */
  async isUnique(
    scope: TableScope,
    slug: string,
    excludeId?: number
  ): Promise<boolean> {
    return !(await this.exists(scope, slug, excludeId));
  }

  /** Check if slug is unique across all scopes */
  async isUniqueGlobal(slug: string, excludeId?: number): Promise<boolean> {
    return !(await this.existsGlobal(slug, excludeId));
  }

  /** Create valid and unique slug from input */
  async ensureValidAndUnique(
    input: string,
    scope?: TableScope,
    excludeId?: number
  ): Promise<string> {
    if (!input || typeof input !== 'string') {
      throw new BadRequestException('Input must be a non-empty string');
    }

    const base = toSlug(input);
    this.assertValid(base);

    let candidate = base;
    let i = 2;

    const checkExists = scope
      ? async (s: string) => this.exists(scope, s, excludeId)
      : async (s: string) => this.existsGlobal(s, excludeId);

    while (await checkExists(candidate)) {
      candidate = `${base}-${i++}`;
    }

    return candidate;
  }
}
