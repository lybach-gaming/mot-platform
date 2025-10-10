import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service';
import { RedisService } from '../../core/redis/redis.service';
import { CacheKey } from '../../common/constants/cache-key';
import { CACHE_TTL_MAX } from '../../common/constants/app';
import {
  LANGUAGE_SCHEMA,
  CATEGORY_SCHEMA,
  SUBCATEGORY_SCHEMA,
  SUBCATEGORY_LEVEL_SCHEMA,
  QUIZZ_SCHEMA,
  QUESTION_SCHEMA,
  GUESS_THE_WORD_SCHEMA,
  FUN_N_LEARN_SCHEMA,
  USERS_SCHEMA,
  MONTH_WEEK_SCHEMA,
  CONTEST_SCHEMA,
  ADMIN_SCHEMA,
} from '../../core/database/schemas';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  private readonly CACHE_CONFIG = {
    keys: {
      counts: CacheKey.AdminDashboardCounts,
      stats: (type: string) => `${CacheKey.AdminDashboardUserStats}${type}`,
    },
    ttl: CACHE_TTL_MAX,
  } as const;

  constructor(
    private readonly dbService: DatabaseService,
    private readonly redisService: RedisService
  ) {}

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async getDashboardCounts(syncNow = false) {
    const cacheKey = this.CACHE_CONFIG.keys.counts;

    if (!syncNow) {
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    }

    try {
      const today = this.formatDate(new Date()); // Format to YYYY-MM-DD

      const counts = await this.fetchAllCounts(
        this.dbService.connection,
        today
      );
      const response = {
        error: false,
        data: counts,
      };

      await this.redisService.set(
        cacheKey,
        JSON.stringify(response),
        this.CACHE_CONFIG.ttl
      );
      return response;
    } catch (error) {
      this.logger.error('Error fetching dashboard counts:', error);
      throw error;
    }
  }

  async getUserStatistics(
    filterType: 'day' | 'week' | 'month',
    syncNow = false
  ) {
    const cacheKey = this.CACHE_CONFIG.keys.stats(filterType);

    if (!syncNow) {
      const cachedData = await this.redisService.get(cacheKey);
      if (cachedData) {
        return JSON.parse(cachedData);
      }
    }

    try {
      const stats = await this.fetchUserStats(filterType);
      const response = {
        error: false,
        data: stats,
      };

      await this.redisService.set(
        cacheKey,
        JSON.stringify(response),
        this.CACHE_CONFIG.ttl
      );
      return response;
    } catch (error) {
      this.logger.error(
        `Error fetching user statistics for ${filterType}:`,
        error
      );
      throw error;
    }
  }

  private async fetchAllCounts(connection: any, today: string) {
    const [
      languages,
      categories,
      subcategories,
      subcategoryLevels,
      quizzes,
      questions,
      liveContests,
      funAndLearn,
      guessTheWord,
      allUsers,
      systemUsers,
    ] = await Promise.all([
      this.getLanguageCount(connection),
      this.getCategoryCount(connection),
      this.getSubcategoryCount(connection),
      this.getSubcategoryLevelCount(connection),
      this.getQuizCount(connection),
      this.getQuestionCount(connection),
      this.getLiveContestCount(connection, today),
      this.getFunAndLearnCount(connection),
      this.getGuessTheWordCount(connection),
      this.getAllUserCount(connection),
      this.getSystemUserCount(connection),
    ]);

    return {
      languages,
      categories,
      subcategories,
      subcategoryLevels,
      quizzes,
      questions,
      liveContests,
      funAndLearn,
      guessTheWord,
      allUsers,
      systemUsers,
    };
  }

  private async fetchUserStats(filterType: 'day' | 'week' | 'month') {
    const connection = this.dbService.connection;
    const today = new Date();

    switch (filterType) {
      case 'month':
        return this.getMonthlyStats(connection, today);
      case 'week':
        return this.getWeeklyStats(connection, today);
      case 'day':
        return this.getDailyStats(connection, today);
    }
  }

  private async getLanguageCount(connection: any): Promise<number> {
    const result = await connection(LANGUAGE_SCHEMA.TABLE)
      .where(LANGUAGE_SCHEMA.FIELDS.STATUS, 1)
      .where(LANGUAGE_SCHEMA.FIELDS.TYPE, 1)
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  private async getCategoryCount(connection: any): Promise<number> {
    const result = await connection(CATEGORY_SCHEMA.TABLE)
      .where(CATEGORY_SCHEMA.FIELDS.TYPE, 1) // 1 for Quiz HQ mode
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  private async getSubcategoryCount(connection: any): Promise<number> {
    const result = await connection(SUBCATEGORY_SCHEMA.TABLE)
      .join(
        CATEGORY_SCHEMA.TABLE,
        `${SUBCATEGORY_SCHEMA.TABLE}.${SUBCATEGORY_SCHEMA.FIELDS.MAINCAT_ID}`,
        `${CATEGORY_SCHEMA.TABLE}.${CATEGORY_SCHEMA.FIELDS.ID}`
      )
      .where(CATEGORY_SCHEMA.FIELDS.TYPE, 1) // 1 for Quiz HQ mode
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  private async getSubcategoryLevelCount(connection: any): Promise<number> {
    const result = await connection(SUBCATEGORY_LEVEL_SCHEMA.TABLE)
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  private async getQuizCount(connection: any): Promise<number> {
    const result = await connection(QUIZZ_SCHEMA.TABLE)
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  private async getQuestionCount(connection: any): Promise<number> {
    const result = await connection(QUESTION_SCHEMA.TABLE)
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  private async getLiveContestCount(
    connection: any,
    today: string
  ): Promise<number> {
    const result = await connection(CONTEST_SCHEMA.TABLE)
      .where(`${CONTEST_SCHEMA.FIELDS.START_DATE}`, '<=', today)
      .where(`${CONTEST_SCHEMA.FIELDS.END_DATE}`, '>', today)
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  private async getFunAndLearnCount(connection: any): Promise<number> {
    const result = await connection(FUN_N_LEARN_SCHEMA.TABLE)
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  private async getGuessTheWordCount(connection: any): Promise<number> {
    const result = await connection(GUESS_THE_WORD_SCHEMA.TABLE)
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  private async getAllUserCount(connection: any): Promise<number> {
    const result = await connection(USERS_SCHEMA.TABLE)
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  private async getSystemUserCount(connection: any): Promise<number> {
    const result = await connection(ADMIN_SCHEMA.TABLE)
      .where(ADMIN_SCHEMA.FIELDS.STATUS, 0)
      .count('* as count')
      .first();
    return Number(result?.count || 0);
  }

  private async getMonthlyStats(connection: any, date: Date) {
    return await connection(MONTH_WEEK_SCHEMA.TABLE)
      .where(MONTH_WEEK_SCHEMA.FIELDS.TYPE, 1)
      .select(MONTH_WEEK_SCHEMA.FIELDS.NAME + ' as month_name')
      .select(
        connection.raw(
          `
        COALESCE((
          SELECT COUNT(${USERS_SCHEMA.FIELDS.ID})
          FROM ${USERS_SCHEMA.TABLE}
          WHERE YEAR(${USERS_SCHEMA.FIELDS.DATE_REGISTERED}) = ?
          AND MONTHNAME(${USERS_SCHEMA.FIELDS.DATE_REGISTERED}) = ${MONTH_WEEK_SCHEMA.TABLE}.${MONTH_WEEK_SCHEMA.FIELDS.NAME}
          GROUP BY MONTH(${USERS_SCHEMA.FIELDS.DATE_REGISTERED})
        ), 0) as user_count
      `,
          [date.getFullYear()]
        )
      )
      .orderBy(
        connection.raw(
          `MONTH(STR_TO_DATE(${MONTH_WEEK_SCHEMA.FIELDS.NAME}, '%M'))`
        )
      );
  }

  private async getWeeklyStats(connection: any, date: Date) {
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();

    return await connection(MONTH_WEEK_SCHEMA.TABLE)
      .where(MONTH_WEEK_SCHEMA.FIELDS.TYPE, 2)
      .select(MONTH_WEEK_SCHEMA.FIELDS.NAME + ' as day_name')
      .select(
        connection.raw(
          `
        COALESCE((
          SELECT COUNT(${USERS_SCHEMA.FIELDS.ID})
          FROM ${USERS_SCHEMA.TABLE}
          WHERE MONTH(${USERS_SCHEMA.FIELDS.DATE_REGISTERED}) = ?
          AND YEAR(${USERS_SCHEMA.FIELDS.DATE_REGISTERED}) = ?
          AND DAYNAME(${USERS_SCHEMA.FIELDS.DATE_REGISTERED}) = ${MONTH_WEEK_SCHEMA.TABLE}.${MONTH_WEEK_SCHEMA.FIELDS.NAME}
          GROUP BY DAYOFWEEK(${USERS_SCHEMA.FIELDS.DATE_REGISTERED})
        ), 0) as user_count
      `,
          [currentMonth, currentYear]
        )
      )
      .orderBy(
        connection.raw(
          `FIELD(${MONTH_WEEK_SCHEMA.FIELDS.NAME}, 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')`
        )
      );
  }

  private async getDailyStats(connection: any, date: Date) {
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();

    return await connection(USERS_SCHEMA.TABLE)
      .select(
        connection.raw(
          `DAYOFMONTH(${USERS_SCHEMA.FIELDS.DATE_REGISTERED}) as day_name`
        ),
        connection.raw(`COUNT(${USERS_SCHEMA.FIELDS.ID}) as user_count`)
      )
      .whereRaw(`MONTH(${USERS_SCHEMA.FIELDS.DATE_REGISTERED}) = ?`, [
        currentMonth,
      ])
      .andWhereRaw(`YEAR(${USERS_SCHEMA.FIELDS.DATE_REGISTERED}) = ?`, [
        currentYear,
      ])
      .groupByRaw(`DATE(${USERS_SCHEMA.FIELDS.DATE_REGISTERED})`)
      .orderByRaw(`DAYOFMONTH(${USERS_SCHEMA.FIELDS.DATE_REGISTERED})`);
  }
}
