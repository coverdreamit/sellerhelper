/**
 * 발주서(엑셀) 컬럼 키 — 백엔드 VendorOrderFormService.ALLOWED_PURCHASE_COLUMN_KEYS 및 VendorOrderLineDto 와 동일
 */
export interface PurchaseOrderExportColumnDef {
  key: string;
  label: string;
}

export const PURCHASE_ORDER_EXPORT_COLUMNS: PurchaseOrderExportColumnDef[] = [
  { key: 'orderUid', label: '주문 UID' },
  { key: 'mallOrderNo', label: '몰 주문번호' },
  { key: 'orderDate', label: '주문일시' },
  { key: 'orderStatus', label: '주문상태' },
  { key: 'orderTotalAmount', label: '주문금액' },
  { key: 'buyerName', label: '주문자' },
  { key: 'buyerPhone', label: '주문자 연락처' },
  { key: 'receiverName', label: '수령인' },
  { key: 'receiverPhone', label: '수령인 연락처' },
  { key: 'receiverAddress', label: '배송지' },
  { key: 'orderItemUid', label: '주문라인 UID' },
  { key: 'mallItemId', label: '몰 상품주문번호' },
  { key: 'productName', label: '상품명' },
  { key: 'optionInfo', label: '옵션' },
  { key: 'quantity', label: '수량' },
  { key: 'productOrderStatus', label: '상품주문상태' },
  { key: 'channelType', label: '채널' },
  { key: 'externalProductId', label: '외부 상품 ID' },
  { key: 'externalOptionId', label: '외부 옵션 ID' },
  { key: 'sellerSku', label: '판매자 SKU' },
];

const LABEL_BY_KEY = Object.fromEntries(PURCHASE_ORDER_EXPORT_COLUMNS.map((c) => [c.key, c.label]));

export function getPurchaseExportLabel(key: string): string {
  return LABEL_BY_KEY[key] ?? key;
}

export const DEFAULT_PURCHASE_ORDER_COLUMN_KEYS = [
  'mallOrderNo',
  'mallItemId',
  'productName',
  'optionInfo',
  'quantity',
  'receiverName',
  'receiverPhone',
  'receiverAddress',
  'orderDate',
];

export function purchaseColumnKeysByCatalog(selectedKeys: Set<string>): string[] {
  return PURCHASE_ORDER_EXPORT_COLUMNS.map((c) => c.key).filter((k) => selectedKeys.has(k));
}
