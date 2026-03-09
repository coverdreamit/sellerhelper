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
  /** 쿠팡: 업체코드(Vendor ID) */
  mallSellerId?: string;
}

export interface StoreMyUpdateParams {
  name?: string;
  enabled?: boolean;
  apiKey?: string;
  apiSecret?: string;
  /** 쿠팡: 업체코드(Vendor ID) */
  mallSellerId?: string;
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

/** 스토어 상품목록 조회 (네이버 스마트스토어) */
export interface NaverProductItem {
  channelProductNo?: string;
  productName?: string;
  salePrice?: number;
  stockQuantity?: number;
  statusType?: string;
  representativeImageUrl?: string;
  leafCategoryId?: string;
}

export interface StoreProductsResult {
  contents: NaverProductItem[];
  page: number;
  size: number;
  totalCount: number;
  /** 쿠팡 DB 동기화 시 마지막 동기화 시각 (ISO 문자열) */
  lastSyncedAt?: string | null;
}

export async function fetchStoreProducts(
  storeUid: number,
  page = 1,
  size = 20
): Promise<StoreProductsResult> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  const res = await apiFetch(`/api/my-stores/${storeUid}/products?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '상품 목록 조회 실패');
  }
  return res.json();
}

/** 쿠팡 상품 목록 동기화 (API → DB 저장). 완료 후 목록을 다시 불러오면 DB에서 조회됨 */
export async function syncStoreProducts(storeUid: number): Promise<void> {
  const res = await apiFetch(`/api/my-stores/${storeUid}/products/sync`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '상품 목록 동기화 실패');
  }
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

/** 배송 목록 1건 (API 응답) */
export interface ShippingListItem {
  orderId: string;
  storeName: string;
  receiverName: string;
  status: string;
  invoice: string;
  orderDate: string | null;
}

/** 배송 목록 조회 결과 */
export interface ShippingListResult {
  contents: ShippingListItem[];
  page: number;
  size: number;
  totalCount: number;
  lastSyncedAt?: string | null;
}

/** 스토어 배송 목록 조회 (DB 저장분). 동기화 후 조회 가능 */
export async function fetchStoreShippings(
  storeUid: number,
  page = 1,
  size = 20,
  status?: string
): Promise<ShippingListResult> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (status) params.set('status', status);
  const res = await apiFetch(`/api/my-stores/${storeUid}/shippings?${params}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '배송 목록 조회 실패');
  }
  return res.json();
}

/** 배송 목록 동기화 (네이버 등 주문/배송 API → DB 저장). 완료 후 목록 다시 불러오면 DB에서 조회 */
export async function syncStoreShippings(storeUid: number): Promise<void> {
  const res = await apiFetch(`/api/my-stores/${storeUid}/shippings/sync`, { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '배송 목록 동기화 실패');
  }
}
