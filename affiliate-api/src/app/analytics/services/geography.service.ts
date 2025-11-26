import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClickEntity } from '../entities';
import { DateRangeService } from './date-range.service';
import { GeographyResponseDto, CountryPerformanceDto, PaginationMetaDto } from '../dto';
import { TimePeriod } from '../types/period.types';
import { roundToTwoDecimals } from '../../../shared/utils/calculation.utils';

@Injectable()
export class GeographyService {
  private readonly ALLOWED_SORT_FIELDS = ['country', 'clicks', 'conversions', 'revenue', 'commission', 'conversionRate'];

  constructor(
    @InjectRepository(ClickEntity)
    private clickRepo: Repository<ClickEntity>,
    private dateRangeService: DateRangeService
  ) {}

  async getGeographyAnalytics(
    projectId: number,
    period: TimePeriod,
    page = 1,
    limit = 10,
    sortBy = 'conversions',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    customFrom?: Date,
    customTo?: Date
  ): Promise<GeographyResponseDto> {
    if (!this.ALLOWED_SORT_FIELDS.includes(sortBy)) {
      sortBy = 'conversions';
    }

    const range = this.dateRangeService.getPeriodRange(period, customFrom, customTo);
    const { startDate, endDate } = range;

    const { countries, totalItems } = await this.getCountriesWithMetricsSQL(
      projectId,
      startDate,
      endDate,
      page,
      limit,
      sortBy,
      sortOrder
    );

    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPreviousPage: page > 1
    };

    return {
      countries,
      meta,
      period,
      dateRange: {
        from: this.dateRangeService.formatDate(startDate),
        to: this.dateRangeService.formatDate(endDate)
      }
    };
  }

  private async getCountriesWithMetricsSQL(
    projectId: number,
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: 'ASC' | 'DESC'
  ): Promise<{ countries: CountryPerformanceDto[]; totalItems: number }> {
    const sqlSortField = this.getSQLSortField(sortBy);

    const query = `
      WITH clicks_by_country AS (
        SELECT
          country,
          COUNT(*) as clicks
        FROM clicks
        WHERE project_id = $1
          AND created_at BETWEEN $2 AND $3
          AND country IS NOT NULL
        GROUP BY country
      ),
      conversions_by_country AS (
        SELECT
          country,
          COUNT(*) as conversions,
          COALESCE(SUM(order_value), 0) as revenue,
          COALESCE(SUM(commission_amount), 0) as commission
        FROM conversions
        WHERE project_id = $1
          AND created_at BETWEEN $2 AND $3
          AND country IS NOT NULL
        GROUP BY country
      ),
      combined AS (
        SELECT
          COALESCE(c.country, conv.country) as country,
          COALESCE(c.clicks, 0) as clicks,
          COALESCE(conv.conversions, 0) as conversions,
          COALESCE(conv.revenue, 0) as revenue,
          COALESCE(conv.commission, 0) as commission,
          CASE
            WHEN COALESCE(c.clicks, 0) > 0
            THEN ROUND((COALESCE(conv.conversions, 0)::numeric / c.clicks::numeric * 100), 2)
            ELSE 0
          END as conversion_rate
        FROM clicks_by_country c
        FULL OUTER JOIN conversions_by_country conv ON c.country = conv.country
      )
      SELECT
        country,
        clicks,
        conversions,
        revenue,
        commission,
        conversion_rate
      FROM combined
      ORDER BY ${sqlSortField} ${sortOrder}
      LIMIT $4 OFFSET $5
    `;

    const countQuery = `
      WITH all_countries AS (
        SELECT DISTINCT country FROM clicks
        WHERE project_id = $1 AND created_at BETWEEN $2 AND $3 AND country IS NOT NULL
        UNION
        SELECT DISTINCT country FROM conversions
        WHERE project_id = $1 AND created_at BETWEEN $2 AND $3 AND country IS NOT NULL
      )
      SELECT COUNT(*) as total FROM all_countries
    `;

    const offset = (page - 1) * limit;
    const [results, countResult] = await Promise.all([
      this.clickRepo.query(query, [projectId, startDate, endDate, limit, offset]),
      this.clickRepo.query(countQuery, [projectId, startDate, endDate])
    ]);

    const totalItems = parseInt(countResult[0]?.total || '0', 10);

    const countries: CountryPerformanceDto[] = results.map((row: Record<string, string | number>) => ({
      country: String(row.country),
      countryName: this.getCountryName(String(row.country)),
      clicks: parseInt(String(row.clicks || '0'), 10),
      conversions: parseInt(String(row.conversions || '0'), 10),
      conversionRate: parseFloat(String(row.conversion_rate || '0')),
      revenue: roundToTwoDecimals(parseFloat(String(row.revenue || '0'))),
      commission: roundToTwoDecimals(parseFloat(String(row.commission || '0')))
    }));

    return { countries, totalItems };
  }

  private getSQLSortField(sortBy: string): string {
    const fieldMap: Record<string, string> = {
      country: 'country',
      clicks: 'clicks',
      conversions: 'conversions',
      revenue: 'revenue',
      commission: 'commission',
      conversionRate: 'conversion_rate'
    };
    return fieldMap[sortBy] || 'conversions';
  }

  private getCountryName(countryCode: string): string {
    const countryNames: Record<string, string> = {
      US: 'United States',
      GB: 'United Kingdom',
      CA: 'Canada',
      AU: 'Australia',
      DE: 'Germany',
      FR: 'France',
      JP: 'Japan',
      CN: 'China',
      IN: 'India',
      BR: 'Brazil'
    };

    return countryNames[countryCode] || countryCode;
  }
}
