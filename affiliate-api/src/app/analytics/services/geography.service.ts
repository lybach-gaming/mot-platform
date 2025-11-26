import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClickEntity, ConversionEntity } from '../entities';
import { DateRangeService } from './date-range.service';
import { GeographyResponseDto, CountryPerformanceDto, PaginationMetaDto } from '../dto';
import { TimePeriod } from '../types/period.types';

@Injectable()
export class GeographyService {
  constructor(
    @InjectRepository(ClickEntity)
    private clickRepo: Repository<ClickEntity>,
    @InjectRepository(ConversionEntity)
    private conversionRepo: Repository<ConversionEntity>,
    private dateRangeService: DateRangeService
  ) {}

  async getGeographyAnalytics(
    projectId: number,
    period: TimePeriod,
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'conversions',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    customFrom?: Date,
    customTo?: Date
  ): Promise<GeographyResponseDto> {
    const range = this.dateRangeService.getPeriodRange(period, customFrom, customTo);
    const { startDate, endDate } = range;

    const countries = await this.getCountriesWithMetrics(projectId, startDate, endDate);
    const sortedCountries = this.sortCountries(countries, sortBy, sortOrder);

    const totalItems = sortedCountries.length;
    const paginatedCountries = sortedCountries.slice((page - 1) * limit, page * limit);

    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      hasNextPage: page < Math.ceil(totalItems / limit),
      hasPreviousPage: page > 1
    };

    return {
      countries: paginatedCountries,
      meta,
      period,
      dateRange: {
        from: this.dateRangeService.formatDate(startDate),
        to: this.dateRangeService.formatDate(endDate)
      }
    };
  }

  private async getCountriesWithMetrics(
    projectId: number,
    startDate: Date,
    endDate: Date
  ): Promise<CountryPerformanceDto[]> {
    const clicksByCountry = await this.clickRepo
      .createQueryBuilder('c')
      .select('c.country', 'country')
      .addSelect('COUNT(*)', 'clicks')
      .where('c.project_id = :projectId', { projectId })
      .andWhere('c.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('c.country IS NOT NULL')
      .groupBy('c.country')
      .getRawMany();

    const conversionsByCountry = await this.conversionRepo
      .createQueryBuilder('conv')
      .select('conv.country', 'country')
      .addSelect('COUNT(*)', 'conversions')
      .addSelect('COALESCE(SUM(conv.order_value), 0)', 'revenue')
      .addSelect('COALESCE(SUM(conv.commission_amount), 0)', 'commission')
      .where('conv.project_id = :projectId', { projectId })
      .andWhere('conv.created_at BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('conv.country IS NOT NULL')
      .groupBy('conv.country')
      .getRawMany();

    const countryMap = new Map<string, CountryPerformanceDto>();

    clicksByCountry.forEach(row => {
      const country = row.country;
      const clicks = parseInt(row.clicks || '0', 10);

      countryMap.set(country, {
        country,
        countryName: this.getCountryName(country),
        clicks,
        conversions: 0,
        conversionRate: 0,
        revenue: 0,
        commission: 0
      });
    });

    conversionsByCountry.forEach(row => {
      const country = row.country;
      const conversions = parseInt(row.conversions || '0', 10);
      const revenue = parseFloat(row.revenue || '0');
      const commission = parseFloat(row.commission || '0');

      if (countryMap.has(country)) {
        const existing = countryMap.get(country)!;
        existing.conversions = conversions;
        existing.conversionRate = existing.clicks > 0
          ? Math.round((conversions / existing.clicks) * 10000) / 100
          : 0;
        existing.revenue = Math.round(revenue * 100) / 100;
        existing.commission = Math.round(commission * 100) / 100;
      } else {
        countryMap.set(country, {
          country,
          countryName: this.getCountryName(country),
          clicks: 0,
          conversions,
          conversionRate: 0,
          revenue: Math.round(revenue * 100) / 100,
          commission: Math.round(commission * 100) / 100
        });
      }
    });

    return Array.from(countryMap.values());
  }

  private sortCountries(
    countries: CountryPerformanceDto[],
    sortBy: string,
    sortOrder: 'ASC' | 'DESC'
  ): CountryPerformanceDto[] {
    return countries.sort((a, b) => {
      const aValue = a[sortBy as keyof CountryPerformanceDto] || 0;
      const bValue = b[sortBy as keyof CountryPerformanceDto] || 0;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'ASC' ? aValue - bValue : bValue - aValue;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'ASC'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      return 0;
    });
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
