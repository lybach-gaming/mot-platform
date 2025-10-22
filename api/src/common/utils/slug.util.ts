// Correct slug: a-z0-9 and hyphens, not starting/ending with '-', no '//'
export const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const isValidSlug = (s: string): boolean => SLUG_REGEX.test(s);

// (Optional) normalize before save
export const toSlug = (s: string): string =>
  s
    .normalize('NFKD') // split accent from letter
    .replace(/[\u0300-\u036f]/g, '') // remove accent
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
    .replace(/^-+|-+$/g, '');
