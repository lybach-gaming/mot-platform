/**
 * Calculates percentage with 2 decimal precision
 * @param numerator - The numerator value
 * @param denominator - The denominator value
 * @returns Percentage rounded to 2 decimal places, or 0 if denominator is 0
 */
export function calculatePercentage(numerator: number, denominator: number): number {
  if (denominator === 0) {
    return 0;
  }
  return Number(((numerator / denominator) * 100).toFixed(2));
}

/**
 * Rounds a number to 2 decimal places
 * @param value - The value to round
 * @returns Number rounded to 2 decimal places
 */
export function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Calculates Click-Through Rate (CTR)
 * @param clicks - Number of clicks
 * @param impressions - Number of impressions
 * @returns CTR percentage rounded to 2 decimal places
 */
export function calculateCTR(clicks: number, impressions: number): number {
  return calculatePercentage(clicks, impressions);
}

/**
 * Calculates conversion rate
 * @param conversions - Number of conversions
 * @param clicks - Number of clicks
 * @returns Conversion rate percentage rounded to 2 decimal places
 */
export function calculateConversionRate(conversions: number, clicks: number): number {
  return calculatePercentage(conversions, clicks);
}

/**
 * Calculates Return on Investment (ROI)
 * @param revenue - Total revenue
 * @param commission - Total commission paid
 * @returns ROI percentage rounded to 2 decimal places
 */
export function calculateROI(revenue: number, commission: number): number {
  if (commission === 0) {
    return 0;
  }
  return Number((((revenue - commission) / commission) * 100).toFixed(2));
}

/**
 * Calculates average order value
 * @param totalRevenue - Total revenue
 * @param totalOrders - Total number of orders
 * @returns Average order value rounded to 2 decimal places
 */
export function calculateAverageOrderValue(totalRevenue: number, totalOrders: number): number {
  if (totalOrders === 0) {
    return 0;
  }
  return roundToTwoDecimals(totalRevenue / totalOrders);
}

/**
 * Calculates dropoff percentage in a funnel
 * @param previous - Previous stage count
 * @param current - Current stage count
 * @returns Dropoff percentage rounded to 2 decimal places
 */
export function calculateDropoff(previous: number, current: number): number {
  if (previous === 0) {
    return 0;
  }
  return calculatePercentage(previous - current, previous);
}
