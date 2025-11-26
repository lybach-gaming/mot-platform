import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString, ValidateIf } from 'class-validator';
import { TimePeriod } from '../../types';

export class PeriodQueryDto {
  @ApiProperty({
    description: 'Time period for analytics',
    enum: TimePeriod,
    required: false,
    default: TimePeriod.LAST_30_DAYS,
    example: TimePeriod.LAST_30_DAYS
  })
  @IsOptional()
  @IsEnum(TimePeriod)
  period?: TimePeriod = TimePeriod.LAST_30_DAYS;

  @ApiProperty({
    description: 'Custom start date (YYYY-MM-DD)',
    required: false,
    example: '2025-01-01'
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiProperty({
    description: 'Custom end date (YYYY-MM-DD)',
    required: false,
    example: '2025-01-31'
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf(o => o.from !== undefined)
  to?: string;
}
