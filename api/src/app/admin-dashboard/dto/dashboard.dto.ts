import { IsEnum } from 'class-validator';

export class UserStatisticsQueryDto {
  @IsEnum(['day', 'week', 'month'])
  filterType!: 'day' | 'week' | 'month';
  syncNow?: boolean;
}
