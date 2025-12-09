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
  Max,
  Matches,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  Validate
} from 'class-validator';
import { Type } from 'class-transformer';
import { CommissionType, BonusType } from '../../types';

// Custom validator to check validTo is after validFrom
@ValidatorConstraint({ name: 'isValidDateRange', async: false })
export class IsValidDateRangeConstraint implements ValidatorConstraintInterface {
  validate(validTo: any, args: ValidationArguments) {
    const object = args.object as any;
    if (!validTo || !object.validFrom) {
      return true; // Skip validation if either date is missing
    }
    return new Date(validTo) > new Date(object.validFrom);
  }

  defaultMessage(args: ValidationArguments) {
    return 'validTo must be after validFrom';
  }
}

// Custom validator to check maxSales > minSales
@ValidatorConstraint({ name: 'isValidSalesRange', async: false })
export class IsValidSalesRangeConstraint implements ValidatorConstraintInterface {
  validate(maxSales: any, args: ValidationArguments) {
    const object = args.object as any;
    if (maxSales === undefined || maxSales === null) {
      return true; // Skip validation if maxSales is not provided
    }
    return maxSales > object.minSales;
  }

  defaultMessage(args: ValidationArguments) {
    return 'maxSales must be greater than minSales';
  }
}

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
  @Validate(IsValidSalesRangeConstraint)
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
  @Validate(IsValidDateRangeConstraint)
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

  @ApiProperty({ example: 'USD', description: 'ISO 4217 currency code (e.g., USD, EUR, GBP)' })
  @IsString()
  @Matches(/^[A-Z]{3}$/, { message: 'Currency must be a valid 3-letter ISO 4217 code' })
  currency: string;

  @ApiProperty({ example: '30% recurring' })
  @IsString()
  displayText: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
