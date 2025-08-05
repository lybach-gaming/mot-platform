/**
 * Normalize form-data body to handle indexed fields
 * @param raw - Raw form-data body
 * @returns Normalized body with indexed fields converted to arrays
 */
export function normalizeIndexedFormData(
  raw: Record<string, any>
): Record<string, any> {
  const indexedRegex = /^(\w+)\[(\d+)\]\.(.+)$/;

  const collections: Record<string, Record<number, any>> = {};
  const otherFields: Record<string, any> = {};

  for (const key in raw) {
    const match = key.match(indexedRegex);
    if (match) {
      const collectionKey = match[1]; // e.g. 'items' or 'questions'
      const index = Number(match[2]);
      const field = match[3];

      if (!collections[collectionKey]) collections[collectionKey] = {};
      if (!collections[collectionKey][index])
        collections[collectionKey][index] = {};

      collections[collectionKey][index][field] = raw[key];
    } else {
      otherFields[key] = raw[key];
    }
  }

  // Convert nested indexed objects to arrays
  const normalized = { ...otherFields };
  for (const key in collections) {
    normalized[key] = Object.values(collections[key]);
  }

  return normalized;
}
