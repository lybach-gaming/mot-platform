export function transformToString(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'number') {
    return String(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformToString(item));
  }

  if (typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      result[key] = transformToString(obj[key]);
    }
    return result;
  }

  return obj;
}
