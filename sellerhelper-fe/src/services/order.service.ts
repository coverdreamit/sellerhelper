/** 주문 목록 API (네이버 스마트스토어 동기화 저장분 조회) */
import { apiFetch } from '@/lib/api';

export interface OrderListItem {
  uid: number;
  storeUid: number;
  storeName: string;
  mallOrderNo: string;
  orderDate: string;
  orderStatus: string;
  totalAmount: number;
  buyerName: string;
  buyerPhone: string;
  receiverName: string;
  receiverAddress: string;
  itemCount: number;
}

export interface OrderListPage {
  content: OrderListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface OrderItemDetail {
  uid: number;
  mallItemId: string;
  productName: string;
  optionInfo: string | null;
  quantity: number;
  unitPrice: number | null;
  totalPrice: number | null;
  productOrderStatus: string;
}

export interface OrderDetail {
  uid: number;
  storeUid: number;
  storeName: string;
  mallOrderNo: string;
  orderDate: string;
  orderStatus: string;
  totalAmount: number;
  buyerName: string;
  buyerPhone: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  items: OrderItemDetail[];
}

export interface OrderActionResult {
  success: boolean;
  action: string;
  requestedCount: number;
  data?: unknown;
}

export async function fetchOrderList(
  storeUid: number,
  page = 0,
  size = 20
): Promise<OrderListPage> {
  const res = await apiFetch(
    `/api/my-stores/${storeUid}/orders?page=${page}&size=${size}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '주문 목록 조회 실패');
  }
  const data = await res.json();
  // 백엔드 PageResponse: content, totalElements / 상품목록형: contents, totalCount 둘 다 허용
  const content = data.content ?? data.contents ?? [];
  const totalElements = data.totalElements ?? data.totalCount ?? 0;
  const totalPages =
    data.totalPages ?? (data.size > 0 ? Math.ceil(totalElements / data.size) : 0);
  return {
    content: Array.isArray(content) ? content : [],
    page: data.page ?? 0,
    size: data.size ?? 20,
    totalElements: Number(totalElements),
    totalPages: Number(totalPages),
    first: data.first ?? true,
    last: data.last ?? true,
  };
}

export async function syncOrdersFromNaver(storeUid: number): Promise<number> {
  const res = await apiFetch(`/api/my-stores/${storeUid}/orders/sync`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '주문 동기화 실패');
  }
  const count = await res.json();
  return typeof count === 'number' ? count : 0;
}

export async function fetchOrderDetail(
  storeUid: number,
  orderUid: number
): Promise<OrderDetail> {
  const res = await apiFetch(`/api/my-stores/${storeUid}/orders/${orderUid}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '주문 상세 조회 실패');
  }
  return await res.json();
}

export async function confirmOrder(
  storeUid: number,
  orderUid: number
): Promise<OrderActionResult> {
  const res = await apiFetch(`/api/my-stores/${storeUid}/orders/${orderUid}/confirm`, {
    method: 'POST',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '발주 확인 처리 실패');
  }
  return await res.json();
}

export async function dispatchOrder(
  storeUid: number,
  orderUid: number,
  payload: { deliveryCompany: string; trackingNumber: string }
): Promise<OrderActionResult> {
  const res = await apiFetch(`/api/my-stores/${storeUid}/orders/${orderUid}/dispatch`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '발송 처리 실패');
  }
  return await res.json();
}

/** 취소/반품/교환 목록 API */
export interface ClaimListItem {
  orderItemUid: number;
  orderUid: number;
  mallOrderNo: string;
  mallItemId: string;
  storeUid: number;
  storeName: string;
  claimType: string;
  productOrderStatus: string;
  productName: string;
  optionInfo: string | null;
  quantity: number;
  totalPrice: number;
  orderDate: string | null;
}

export interface ClaimListPage {
  content: ClaimListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export async function fetchClaimList(
  storeUid: number,
  page = 0,
  size = 20,
  claimType?: string,
  keyword?: string
): Promise<ClaimListPage> {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('size', String(size));
  if (claimType && claimType.trim()) params.set('claimType', claimType.trim());
  if (keyword && keyword.trim()) params.set('keyword', keyword.trim());
  const res = await apiFetch(
    `/api/my-stores/${storeUid}/claims?${params.toString()}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '취소/반품/교환 목록 조회 실패');
  }
  const data = await res.json();
  const content = data.content ?? data.contents ?? [];
  const totalElements = data.totalElements ?? data.totalCount ?? 0;
  const totalPages =
    data.totalPages ??
    (data.size > 0 ? Math.ceil(totalElements / data.size) : 0);
  return {
    content: Array.isArray(content) ? content : [],
    page: data.page ?? 0,
    size: data.size ?? 20,
    totalElements: Number(totalElements),
    totalPages: Number(totalPages),
    first: data.first ?? true,
    last: data.last ?? true,
  };
}
