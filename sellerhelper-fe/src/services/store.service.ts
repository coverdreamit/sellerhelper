/**
 * 스토어 서비스 (mock / API 교체 지점)
 * 나중에 env로 전환: process.env.NEXT_PUBLIC_USE_MOCK
 */
const USE_MOCK = true;

import { storesMock } from '@/mocks/stores';

export async function fetchStores() {
  if (USE_MOCK) {
    return Promise.resolve(storesMock.stores);
  }
  const res = await fetch('/api/stores');
  if (!res.ok) throw new Error('Failed to fetch stores');
  const data = await res.json();
  return data.stores ?? data;
}
