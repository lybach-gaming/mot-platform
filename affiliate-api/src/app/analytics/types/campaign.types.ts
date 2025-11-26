/**
 * Campaign metadata structure
 */
export interface CampaignMetadata {
  /** Campaign source (e.g., 'twitter', 'facebook', 'email') */
  source?: string;
  /** Target audience description */
  targetAudience?: string;
  /** Campaign tags for categorization */
  tags?: string[];
  /** Geographic targeting */
  targetCountries?: string[];
  /** Custom tracking parameters */
  trackingParams?: Record<string, string>;
  /** Additional custom fields */
  customFields?: Record<string, string | number | boolean>;
}

/**
 * Campaign status enum
 */
export enum CampaignStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  INACTIVE = 'inactive',
  COMPLETED = 'completed'
}
