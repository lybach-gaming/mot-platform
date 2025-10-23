import { IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserStatisticsQueryDto {
  @IsEnum(['day', 'week', 'month'])
  filterType!: 'day' | 'week' | 'month';

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === '1') return true;
    if (value === 'false' || value === '0') return false;
    return value;
  })
  syncNow?: boolean;
}
