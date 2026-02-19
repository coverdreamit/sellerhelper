/**
 * 사용자 스토어 연결 서비스 (mock / API 교체 지점)
 */
const USE_MOCK = true;

import { userStoresMock } from '@/mocks/userStores';

export async function fetchUserStores() {
  if (USE_MOCK) {
    return Promise.resolve(userStoresMock.userStores);
  }
  const res = await fetch('/api/user-stores');
  if (!res.ok) throw new Error('Failed to fetch user stores');
  const data = await res.json();
  return data.userStores ?? data;
}

export async function connectUserStore(storeCode, payload = {}) {
  if (USE_MOCK) {
    return Promise.resolve({
      storeCode,
      isEnabled: true,
      authStatus: 'CONNECTED',
      lastSyncAt: new Date().toISOString(),
    });
  }
  const res = await fetch(`/api/user-stores/${storeCode}/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Connect failed');
  return res.json();
}
