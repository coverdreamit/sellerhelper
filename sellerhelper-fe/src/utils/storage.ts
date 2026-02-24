/**
 * localStorage helpers - use instead of cookies for UI state to reduce Cookie header size
 */

export function getStorage(key: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, value);
  } catch {
    // ignore (quota exceeded, private mode, etc.)
  }
}
