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
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (period === TimePeriod.CUSTOM) {
      if (!customFrom || !customTo) {
        throw new Error('Custom period requires both from and to dates');
      }
      return {
        startDate: new Date(customFrom.getFullYear(), customFrom.getMonth(), customFrom.getDate(), 0, 0, 0, 0),
        endDate: new Date(customTo.getFullYear(), customTo.getMonth(), customTo.getDate(), 23, 59, 59, 999)
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
        startDate = new Date(2020, 0, 1);
        break;

      default:
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
    }

    startDate.setHours(0, 0, 0, 0);

    return { startDate, endDate };
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
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });

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
