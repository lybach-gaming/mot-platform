import { ValueTransformer } from 'typeorm';

/**
 * TypeORM transformer for decimal columns
 * Converts database decimal strings to numbers and vice versa
 * Handles precision issues by ensuring proper conversion
 */
export const decimalTransformer: ValueTransformer = {
  /**
   * Transforms value from database (string) to entity (number)
   */
  from(value: string | null | undefined): number | null {
    if (value === null || value === undefined) {
      return null;
    }
    return parseFloat(value);
  },

  /**
   * Transforms value from entity (number) to database (string)
   */
  to(value: number | null | undefined): string | null {
    if (value === null || value === undefined) {
      return null;
    }
    return value.toString();
  }
};
