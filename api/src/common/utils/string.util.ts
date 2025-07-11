export function isValidUrl(string: string) {
  try {
    new URL(string);
    return true;
  } catch (error_) {
    return false;
  }
}

export function urlJoin(...segments: string[]): string {
  return segments.join('/').replace(/([^:])\/{2,}/g, '$1/');
}
