/** 배송 목록 API (주문 DB 저장분, 네이버 동기화 후 조회) */
import { apiFetch } from '@/lib/api';

/** 배송 상태: 네이버 기준 PAYED=출고대기, DELIVERING=배송중, DELIVERED=배송완료 */
export const SHIPPING_STATUS = {
  PAYED: 'PAYED',       // 출고대기
  DELIVERING: 'DELIVERING', // 배송중
  DELIVERED: 'DELIVERED',  // 배송완료
} as const;

export interface ShippingListItem {
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

export interface ShippingListPage {
  content: ShippingListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export async function fetchShippingList(
  storeUid: number,
  page = 0,
  size = 20,
  orderStatus?: string
): Promise<ShippingListPage> {
  const params = new URLSearchParams({ page: String(page), size: String(size) });
  if (orderStatus && orderStatus.trim()) {
    params.set('orderStatus', orderStatus.trim());
  }
  const res = await apiFetch(
    `/api/my-stores/${storeUid}/shipping?${params.toString()}`
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || '배송 목록 조회 실패');
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
