/** 셀러용 스토어 연동 API (환경설정 > 스토어 연동) */
import { apiFetch } from '@/lib/api';

export interface MyStoreItem {
  uid: number;
  mallUid: number;
  mallCode: string;
  mallName: string;
  name: string;
  mallSellerId?: string;
  enabled: boolean;
  hasAuth: boolean;
  hasStoredCredentials?: boolean;
  sortOrder?: number;
}

export interface StoreConnectParams {
  mallUid: number;
  name: string;
  apiKey?: string;
  apiSecret?: string;
}

export interface StoreMyUpdateParams {
  name?: string;
  enabled?: boolean;
  apiKey?: string;
  apiSecret?: string;
}

export async function fetchMyStores(): Promise<MyStoreItem[]> {
  const res = await apiFetch('/api/my-stores');
  if (!res.ok) throw new Error('내 스토어 목록 조회 실패');
  const data = await res.json();
  return Array.isArray(data) ? data : data.stores ?? [];
}

export async function reorderMyStores(storeUids: number[]): Promise<void> {
  const res = await apiFetch('/api/my-stores/reorder', {
    method: 'PUT',
    body: JSON.stringify({ storeUids }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '순서 변경 실패');
  }
}

export async function disconnectMyStore(storeUid: number): Promise<void> {
  const res = await apiFetch(`/api/my-stores/${storeUid}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '연동 해제 실패');
  }
}

export async function updateMyStore(storeUid: number, params: StoreMyUpdateParams): Promise<MyStoreItem> {
  const res = await apiFetch(`/api/my-stores/${storeUid}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '스토어 수정 실패');
  }
  return res.json();
}

export async function connectMyStore(params: StoreConnectParams): Promise<MyStoreItem> {
  const res = await apiFetch('/api/my-stores', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '스토어 연동 실패');
  }
  return res.json();
}

/** 연동 테스트 (실제 API 호출로 검증, 성공 시 연동됨으로 표시) */
export async function verifyMyStore(storeUid: number): Promise<MyStoreItem> {
  const res = await apiFetch(`/api/my-stores/${storeUid}/verify`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '연동 검증 실패');
  }
  return res.json();
}
