/**
 * 공통 Storage 유틸 - localStorage 기반
 * 쿠키 대신 사용해 Cookie 헤더 크기 절감
 */

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const value = localStorage.getItem(key);
      if (!value) return defaultValue;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T; /* legacy: raw string (e.g. menu_closed_keys) */
      }
    } catch {
      return defaultValue;
    }
  },

  set(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded, private mode 등 */
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
};
