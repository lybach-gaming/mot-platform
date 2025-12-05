import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsObject,
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsISO8601,
  Min,
  Max
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommissionType, BonusType } from '../../types';

export class BaseCommissionDto {
  @ApiProperty({ required: false, example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedAmount?: number;

  @ApiProperty({ required: false, example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;

  @ApiProperty({ required: false, enum: ['gross', 'net'] })
  @IsOptional()
  @IsEnum(['gross', 'net'])
  basis?: 'gross' | 'net';

  @ApiProperty({ required: false, example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minRevenue?: number;
}

export class CommissionTierDto {
  @ApiProperty({ example: 'Bronze' })
  @IsString()
  name: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  minSales: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxSales?: number;

  @ApiProperty({ required: false, example: 20 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage?: number;

  @ApiProperty({ required: false, example: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixedAmount?: number;

  @ApiProperty({ required: false, example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  bonusAmount?: number;
}

export class RecurringConfigDto {
  @ApiProperty({ enum: ['monthly', 'yearly', 'quarterly'], example: 'monthly' })
  @IsEnum(['monthly', 'yearly', 'quarterly'])
  interval: 'monthly' | 'yearly' | 'quarterly';

  @ApiProperty({ required: false, example: 12 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  cycles?: number;

  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  firstCycleBonus?: number;
}

export class BonusConditionDto {
  @ApiProperty({ required: false, example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSales?: number;

  @ApiProperty({ required: false, example: 1000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minRevenue?: number;

  @ApiProperty({ required: false, example: 30 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  timeframe?: number;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specificProducts?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  firstTimeCustomers?: boolean;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  geography?: string[];
}

export class BonusStructureDto {
  @ApiProperty({ example: 'q4-boost' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Q4 Holiday Boost' })
  @IsString()
  name: string;

  @ApiProperty({ enum: BonusType })
  @IsEnum(BonusType)
  type: BonusType;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  value: number;

  @ApiProperty({ type: BonusConditionDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BonusConditionDto)
  conditions: BonusConditionDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  validFrom?: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsISO8601()
  validTo?: Date;

  @ApiProperty({ example: true })
  @IsBoolean()
  stackable: boolean;
}

export class CommissionModelDto {
  @ApiProperty({ enum: CommissionType, example: CommissionType.PERCENTAGE })
  @IsEnum(CommissionType)
  type: CommissionType;

  @ApiProperty({ type: BaseCommissionDto })
  @IsObject()
  @ValidateNested()
  @Type(() => BaseCommissionDto)
  base: BaseCommissionDto;

  @ApiProperty({ required: false, type: [CommissionTierDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CommissionTierDto)
  tiers?: CommissionTierDto[];

  @ApiProperty({ required: false, type: RecurringConfigDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => RecurringConfigDto)
  recurring?: RecurringConfigDto;

  @ApiProperty({ required: false, type: [BonusStructureDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BonusStructureDto)
  bonuses?: BonusStructureDto[];

  @ApiProperty({ example: 'USD' })
  @IsString()
  currency: string;

  @ApiProperty({ example: '30% recurring' })
  @IsString()
  displayText: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
