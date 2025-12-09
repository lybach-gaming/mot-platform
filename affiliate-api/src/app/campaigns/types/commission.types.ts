/**
 * Commission Model Types
 * Flexible, extensible commission structure supporting multiple commission types,
 * tiers, bonuses, and complex conditions.
 */

export enum CommissionType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  TIERED = 'tiered',
  HYBRID = 'hybrid',
  RECURRING = 'recurring',
  REVENUE_SHARE = 'revenue_share'
}

export enum BonusType {
  FIXED_AMOUNT = 'fixed_amount',
  PERCENTAGE_BOOST = 'percentage_boost',
  MULTIPLIER = 'multiplier',
  MILESTONE = 'milestone'
}

export interface CommissionModel {
  type: CommissionType;
  base: BaseCommission;
  tiers?: CommissionTier[];
  recurring?: RecurringConfig;
  bonuses?: BonusStructure[];
  currency: string;
  displayText: string;
  notes?: string;
}

export interface BaseCommission {
  fixedAmount?: number;
  percentage?: number;
  basis?: 'gross' | 'net';
  minRevenue?: number;
}

export interface CommissionTier {
  name: string;
  minSales: number;
  maxSales?: number;
  percentage?: number;
  fixedAmount?: number;
  bonusAmount?: number;
}

export interface RecurringConfig {
  interval: 'monthly' | 'yearly' | 'quarterly';
  cycles?: number;
  firstCycleBonus?: number;
}

export interface BonusStructure {
  id: string;
  name: string;
  type: BonusType;
  value: number;
  conditions: BonusCondition;
  validFrom?: Date;
  validTo?: Date;
  stackable: boolean;
}

export interface BonusCondition {
  minSales?: number;
  minRevenue?: number;
  timeframe?: number;
  specificProducts?: string[];
  firstTimeCustomers?: boolean;
  geography?: string[];
}
