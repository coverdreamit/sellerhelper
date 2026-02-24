/** 시스템 스토어 API (운영자용) */
import { apiFetch } from '@/lib/api';

export interface StoreItem {
  uid: number;
  mallUid: number;
  mallCode: string;
  mallName: string;
  companyUid?: number;
  companyName?: string;
  name: string;
  mallSellerId?: string;
  enabled: boolean;
  hasAuth: boolean;
}

export interface StoreListParams {
  mallUid?: number;
  companyUid?: number;
}

export interface StoreCreateParams {
  mallUid: number;
  companyUid?: number;
  name: string;
  mallSellerId?: string;
  enabled?: boolean;
}

export interface StoreUpdateParams {
  companyUid?: number;
  /** true면 소속 회사 해제 */
  clearCompany?: boolean;
  name?: string;
  mallSellerId?: string;
  enabled?: boolean;
}

export async function fetchSystemStores(params?: StoreListParams): Promise<StoreItem[]> {
  const qs = params
    ? '?' +
      Object.entries(params)
        .filter(([, v]) => v != null)
        .map(([k, v]) => `${k}=${v}`)
        .join('&')
    : '';
  const res = await apiFetch(`/api/stores${qs}`);
  if (!res.ok) throw new Error('스토어 목록 조회 실패');
  const data = await res.json();
  return Array.isArray(data) ? data : data.stores ?? [];
}

export async function fetchSystemStore(uid: number): Promise<StoreItem> {
  const res = await apiFetch(`/api/stores/${uid}`);
  if (!res.ok) throw new Error('스토어 조회 실패');
  return res.json();
}

export async function createSystemStore(params: StoreCreateParams): Promise<StoreItem> {
  const res = await apiFetch('/api/stores', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '스토어 등록 실패');
  }
  return res.json();
}

export async function updateSystemStore(uid: number, params: StoreUpdateParams): Promise<StoreItem> {
  const res = await apiFetch(`/api/stores/${uid}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '스토어 수정 실패');
  }
  return res.json();
}

export async function deleteSystemStore(uid: number): Promise<void> {
  const res = await apiFetch(`/api/stores/${uid}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '스토어 삭제 실패');
  }
}
