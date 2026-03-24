import { apiFetch } from '@/lib/api';

export interface PurchaseOrderHistoryItem {
  uid: number;
  name: string;
  memo?: string;
  createdAt: string;
  updatedAt: string;
  storeUid: number;
  storeName: string;
  vendorId: number;
  vendorName: string;
  orderUids: number[];
  columnKeys: string[];
}

interface PurchaseOrderHistoryCreatePayload {
  name: string;
  memo?: string;
  storeUid: number;
  vendorId: number;
  orderUids: number[];
  columnKeys: string[];
}

interface PurchaseOrderHistoryUpdatePayload {
  name: string;
  memo?: string;
  vendorId: number;
  orderUids: number[];
  columnKeys: string[];
}

export async function listPurchaseOrderHistory(): Promise<PurchaseOrderHistoryItem[]> {
  const res = await apiFetch('/api/purchase-order-histories');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주서 목록 조회 실패');
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createPurchaseOrderHistory(
  payload: PurchaseOrderHistoryCreatePayload
): Promise<PurchaseOrderHistoryItem> {
  const res = await apiFetch('/api/purchase-order-histories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주서 저장 실패');
  }
  return res.json();
}

export async function updatePurchaseOrderHistory(
  uid: number,
  payload: PurchaseOrderHistoryUpdatePayload
): Promise<PurchaseOrderHistoryItem> {
  const res = await apiFetch(`/api/purchase-order-histories/${uid}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주서 수정 실패');
  }
  return res.json();
}

export async function deletePurchaseOrderHistory(uid: number): Promise<void> {
  const res = await apiFetch(`/api/purchase-order-histories/${uid}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주서 삭제 실패');
  }
}
