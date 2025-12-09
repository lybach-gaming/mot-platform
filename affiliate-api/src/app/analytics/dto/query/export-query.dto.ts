import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsArray, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';
import { PeriodQueryDto } from './period-query.dto';

const AVAILABLE_FIELDS = [
  'timestamp',
  'campaignName',
  'country',
  'clicks',
  'conversions',
  'revenueUsd',
  'commissionRatePct',
  'orderValue'
] as const;

export class ExportQueryDto extends PeriodQueryDto {
  @ApiProperty({
    description: 'Fields to include in export (comma-separated)',
    required: false,
    example: 'timestamp,campaignName,revenueUsd',
    type: String
  })
  @IsOptional()
  @Transform(({ value }) => value ? value.split(',').map((f: string) => f.trim()) : AVAILABLE_FIELDS)
  @IsArray()
  @IsIn(AVAILABLE_FIELDS, { each: true })
  fields?: string[] = [...AVAILABLE_FIELDS];

  @ApiProperty({
    description: 'Export format',
    enum: ['csv'],
    required: false,
    default: 'csv'
  })
  @IsOptional()
  @IsIn(['csv'])
  format?: 'csv' = 'csv';
}
