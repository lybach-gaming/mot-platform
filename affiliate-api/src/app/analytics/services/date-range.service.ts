import { Injectable } from '@nestjs/common';
import { TimePeriod } from '../types/period.types';

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

@Injectable()
export class DateRangeService {
  getPeriodRange(period: TimePeriod, customFrom?: Date, customTo?: Date): DateRange {
    const now = new Date();
    const endDate = this.getEndOfDayUTC(now);

    if (period === TimePeriod.CUSTOM) {
      if (!customFrom || !customTo) {
        throw new Error('Custom period requires both from and to dates');
      }
      return {
        startDate: this.getStartOfDayUTC(customFrom),
        endDate: this.getEndOfDayUTC(customTo)
      };
    }

    let startDate: Date;

    switch (period) {
      case TimePeriod.LAST_7_DAYS:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        break;

      case TimePeriod.LAST_30_DAYS:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        break;

      case TimePeriod.LAST_90_DAYS:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 90);
        break;

      case TimePeriod.LAST_YEAR:
        startDate = new Date(now);
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;

      case TimePeriod.ALL_TIME:
        startDate = new Date(Date.UTC(2020, 0, 1, 0, 0, 0, 0));
        return { startDate, endDate };

      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
    }

    startDate = this.getStartOfDayUTC(startDate);

    return { startDate, endDate };
  }

  private getStartOfDayUTC(date: Date): Date {
    return new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0, 0, 0, 0
    ));
  }

  private getEndOfDayUTC(date: Date): Date {
    return new Date(Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23, 59, 59, 999
    ));
  }

  getPreviousPeriod(period: TimePeriod, currentRange: DateRange): DateRange {
    const duration = currentRange.endDate.getTime() - currentRange.startDate.getTime();
    const endDate = new Date(currentRange.startDate.getTime() - 1);
    const startDate = new Date(endDate.getTime() - duration);

    return { startDate, endDate };
  }

  getMonthlyRanges(months: number = 12): Array<DateRange & { label: string }> {
    const ranges: Array<DateRange & { label: string }> = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getUTCFullYear(), now.getUTCMonth() - i, 1);
      const startDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1, 0, 0, 0, 0));
      const endDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0, 23, 59, 59, 999));
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', timeZone: 'UTC' });

      ranges.push({ startDate, endDate, label });
    }

    return ranges;
  }

  isValidDateRange(startDate: Date, endDate: Date): boolean {
    return startDate <= endDate;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
