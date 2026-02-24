/** 플랫폼(Mall) API 서비스 */
import { apiFetch } from '@/lib/api';

export interface MallItem {
  uid: number;
  code: string;
  name: string;
  channel?: string;
  description?: string;
  apiBaseUrl?: string;
  enabled: boolean;
  sortOrder?: number;
}

export interface MallCreateParams {
  code: string;
  name: string;
  channel?: string;
  description?: string;
  apiBaseUrl?: string;
  enabled?: boolean;
}

export interface MallUpdateParams {
  name?: string;
  channel?: string;
  description?: string;
  apiBaseUrl?: string;
  enabled?: boolean;
}

export async function fetchMalls(enabledOnly = false): Promise<MallItem[]> {
  const qs = enabledOnly ? '?enabledOnly=true' : '';
  const res = await apiFetch(`/api/malls${qs}`);
  if (!res.ok) throw new Error('플랫폼 목록 조회 실패');
  const data = await res.json();
  return Array.isArray(data) ? data : data.malls ?? [];
}

export async function fetchMall(uid: number): Promise<MallItem> {
  const res = await apiFetch(`/api/malls/${uid}`);
  if (!res.ok) throw new Error('플랫폼 조회 실패');
  return res.json();
}

export async function createMall(params: MallCreateParams): Promise<MallItem> {
  const res = await apiFetch('/api/malls', {
    method: 'POST',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '플랫폼 등록 실패');
  }
  return res.json();
}

export async function updateMall(uid: number, params: MallUpdateParams): Promise<MallItem> {
  const res = await apiFetch(`/api/malls/${uid}`, {
    method: 'PUT',
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '플랫폼 수정 실패');
  }
  return res.json();
}

export async function deleteMall(uid: number): Promise<void> {
  const res = await apiFetch(`/api/malls/${uid}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '플랫폼 삭제 실패');
  }
}

export async function reorderMalls(mallUids: number[]): Promise<void> {
  const res = await apiFetch('/api/malls/reorder', {
    method: 'PUT',
    body: JSON.stringify({ mallUids }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '순서 변경 실패');
  }
}
