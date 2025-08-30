import dayjs from 'dayjs';

export function transformToString(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'number') {
    return String(obj);
  }

  if (obj instanceof Date) {
    return dayjs(obj).format('YYYY-MM-DD HH:mm:ss');
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => transformToString(item));
  }

  if (typeof obj === 'object') {
    const src = obj as Record<string, any>;
    const result: Record<string, any> = {};
    for (const key of Object.keys(src)) {
      result[key] = transformToString(src[key]);
    }
    return result;
  }

  return obj;
}
