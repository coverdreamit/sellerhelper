/**
 * 주문 목록(OrderListItem)과 동일한 키 — 발주양식·CSV 내보내기 공통
 */
export interface OrderExportColumnDef {
  key: string;
  label: string;
  width: number;
}

export const ORDER_EXPORT_COLUMNS: OrderExportColumnDef[] = [
  { key: 'uid', label: '내부주문UID', width: 100 },
  { key: 'storeUid', label: '스토어UID', width: 90 },
  { key: 'storeName', label: '스토어명', width: 120 },
  { key: 'mallOrderNo', label: '몰주문번호', width: 140 },
  { key: 'orderDate', label: '주문일시', width: 160 },
  { key: 'orderStatus', label: '주문상태', width: 100 },
  { key: 'totalAmount', label: '주문금액', width: 100 },
  { key: 'buyerName', label: '주문자', width: 100 },
  { key: 'buyerPhone', label: '연락처', width: 120 },
  { key: 'receiverName', label: '수령인', width: 100 },
  { key: 'receiverAddress', label: '배송지', width: 220 },
  { key: 'itemCount', label: '상품수', width: 70 },
];

const LABEL_BY_KEY = Object.fromEntries(ORDER_EXPORT_COLUMNS.map((c) => [c.key, c.label]));

export function getOrderExportLabel(key: string): string {
  return LABEL_BY_KEY[key] ?? key;
}

export const DEFAULT_ORDER_EXPORT_COLUMN_KEYS = [
  'mallOrderNo',
  'orderDate',
  'receiverName',
  'receiverAddress',
  'buyerName',
  'buyerPhone',
  'totalAmount',
  'itemCount',
];

/** 체크된 키를 주문 API 필드 정의 순서대로 정렬 (CSV 컬럼 순서) */
export function orderColumnKeysByCatalog(selectedKeys: Set<string>): string[] {
  return ORDER_EXPORT_COLUMNS.map((c) => c.key).filter((k) => selectedKeys.has(k));
}
