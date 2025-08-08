import { Transform } from 'class-transformer';

export function ToNumber(defaultValue?: number) {
  return Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  });
}
