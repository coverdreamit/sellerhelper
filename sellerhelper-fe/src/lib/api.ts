/**
 * API 호출 헬퍼 - JWT Bearer + credentials 포함
 * 프록시 없이 BE(5001) 직접 호출. NEXT_PUBLIC_API_URL로 베이스 URL 설정 (배포 시 예: http://coverdreamit.iptime.org:5001)
 */
import { useAuthStore } from '@/stores';

const DEFAULT_API_BASE = 'http://localhost:5001';

/** BE API 베이스 URL (끝에 슬래시 없음). 배포 시 .env에 NEXT_PUBLIC_API_URL=http://coverdreamit.iptime.org:5001 등 설정 */
export function getApiBase(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE;
  }
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_BASE;
}

function resolveApiUrl(url: string): string {
  if (url.startsWith('http')) return url;
  const base = getApiBase().replace(/\/$/, '');
  return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}

export async function apiFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = useAuthStore.getState().user?.token;
  const headers: Record<string, string> = { ...(init.headers as Record<string, string>) };
  const isFormData = typeof FormData !== 'undefined' && init.body instanceof FormData;
  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return fetch(resolveApiUrl(url), {
    ...init,
    credentials: 'include',
    headers,
  });
}
