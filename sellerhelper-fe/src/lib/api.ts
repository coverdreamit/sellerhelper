/**
 * API 호출 헬퍼 - JWT Bearer + credentials 포함
 * Commerce(5080) API 호출 시 사용
 */
import { useAuthStore } from '@/stores';

export async function apiFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  const token = useAuthStore.getState().user?.token;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  return fetch(url, {
    ...init,
    credentials: 'include',
    headers,
  });
}
