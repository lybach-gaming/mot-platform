import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for user statistics query parameters
 */

export class DashboardCountsQueryDto {
  /**
   * Force sync flag to bypass cache
   * - true/'1': Force sync from database
   * - false/'0': Use cached data if available
   */
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  syncNow?: boolean;
}

export class UserStatisticsQueryDto {
  /**
   * Type of data aggregation filter
   * - day: Daily statistics
   * - week: Weekly statistics
   * - month: Monthly statistics
   */
  @IsEnum(['day', 'week', 'month'])
  filterType!: 'day' | 'week' | 'month';

  /**
   * Force sync flag to bypass cache
   * - true/'1': Force sync from database
   * - false/'0': Use cached data if available
   */
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  syncNow?: boolean;
}
