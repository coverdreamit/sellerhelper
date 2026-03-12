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
