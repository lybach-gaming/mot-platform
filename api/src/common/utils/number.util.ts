// Utility to check if a value is a valid positive integer ID
export const isValidId = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v > 0;
