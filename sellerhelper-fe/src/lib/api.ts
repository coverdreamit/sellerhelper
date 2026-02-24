/**
 * API 호출 헬퍼 - 세션 쿠키 포함 (credentials: 'include')
 * 인증이 필요한 모든 API 호출에 사용
 */
export async function apiFetch(
  url: string,
  init: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });
}
