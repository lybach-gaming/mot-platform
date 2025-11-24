/**
 * Affiliate metadata structure
 */
export interface AffiliateMetadata {
  /** Source of affiliate registration (e.g., 'organic', 'campaign', 'referral') */
  source?: string;
  /** Campaign ID if from a marketing campaign */
  campaignId?: string;
  /** Additional tags for categorization */
  tags?: string[];
  /** Custom fields for extensibility */
  customFields?: Record<string, string | number | boolean>;
}

/**
 * Affiliate statistics structure
 */
export interface AffiliateStats {
  /** Total number of referrals */
  totalReferrals?: number;
  /** Total number of conversions */
  totalConversions?: number;
  /** Total earnings in USD */
  totalEarnings?: number;
  /** Conversion rate percentage */
  conversionRate?: number;
  /** Last activity timestamp */
  lastActivityAt?: Date | string;
  /** Monthly breakdown of performance */
  monthlyStats?: MonthlyStats[];
}

/**
 * Monthly performance statistics
 */
export interface MonthlyStats {
  /** Year (e.g., 2025) */
  year: number;
  /** Month (1-12) */
  month: number;
  /** Referrals in this month */
  referrals: number;
  /** Conversions in this month */
  conversions: number;
  /** Earnings in this month */
  earnings: number;
}
