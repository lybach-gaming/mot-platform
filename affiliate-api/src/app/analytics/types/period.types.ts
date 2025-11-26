/**
 * Supported time period types
 */
export enum TimePeriod {
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_YEAR = 'last_year',
  ALL_TIME = 'all_time',
  CUSTOM = 'custom'
}

/**
 * Date range interface
 */
export interface DateRange {
  startDate: Date;
  endDate: Date;
}

/**
 * Period with comparison range
 */
export interface PeriodComparison {
  current: DateRange;
  previous: DateRange;
  periodLabel: string;
  comparisonLabel: string;
}
