/**
 * 스마트스토어 엑셀(주문·상품·발송)과 DB 동기화 주문을 맞춘 발주서 컬럼 정의.
 * 백엔드 PurchaseOrderExportService 필드 키와 동일해야 합니다.
 */
export interface OrderTemplateField {
  key: string;
  label: string;
  width: number;
}

export const ORDER_TEMPLATE_FIELDS: OrderTemplateField[] = [
  { key: 'mallOrderNo', label: '주문번호', width: 140 },
  { key: 'productOrderNo', label: '상품주문번호', width: 160 },
  { key: 'orderDate', label: '주문일시', width: 150 },
  { key: 'orderStatus', label: '주문상태', width: 100 },
  { key: 'storeName', label: '스토어명', width: 120 },
  { key: 'buyerName', label: '구매자명', width: 100 },
  { key: 'buyerPhone', label: '구매자연락처', width: 120 },
  { key: 'receiverName', label: '수령인명', width: 100 },
  { key: 'receiverPhone', label: '수령인연락처', width: 120 },
  { key: 'receiverAddress', label: '배송지', width: 280 },
  { key: 'productName', label: '상품명', width: 220 },
  { key: 'optionInfo', label: '옵션정보', width: 160 },
  { key: 'quantity', label: '수량', width: 72 },
  { key: 'unitPrice', label: '판매단가', width: 100 },
  { key: 'totalPrice', label: '상품주문금액', width: 110 },
  { key: 'productOrderStatus', label: '상품주문상태', width: 110 },
  { key: 'supplyPrice', label: '공급가(입력)', width: 100 },
  { key: 'remark', label: '비고', width: 150 },
];

const FIELD_KEYS = new Set(ORDER_TEMPLATE_FIELDS.map((f) => f.key));

/** 구 발주양식 키 → 신규 키 (localStorage 마이그레이션) */
const LEGACY_COLUMN_KEY_MAP: Record<string, string> = {
  orderNo: 'mallOrderNo',
  productCode: 'productOrderNo',
  option: 'optionInfo',
  qty: 'quantity',
  amount: 'totalPrice',
};

export const DEFAULT_ORDER_TEMPLATE_COLUMN_KEYS = [
  'mallOrderNo',
  'productOrderNo',
  'orderDate',
  'productName',
  'optionInfo',
  'quantity',
  'unitPrice',
  'totalPrice',
  'receiverName',
  'receiverAddress',
];

export function getOrderTemplateFieldMap(): Record<string, OrderTemplateField> {
  return Object.fromEntries(ORDER_TEMPLATE_FIELDS.map((f) => [f.key, f]));
}

export function migrateColumnKeys(keys: string[]): string[] {
  const next = keys
    .map((k) => LEGACY_COLUMN_KEY_MAP[k] ?? k)
    .filter((k) => FIELD_KEYS.has(k));
  return next.length ? next : [...DEFAULT_ORDER_TEMPLATE_COLUMN_KEYS];
}
