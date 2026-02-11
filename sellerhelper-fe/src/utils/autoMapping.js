/**
 * 발주양식 엑셀 컬럼 → 시스템 컬럼 자동매핑
 * 자동매핑 설정 모달에 저장된 규칙만 사용 (기본값은 모달에서 편집 가능한 규칙으로만 제공)
 */

const STORAGE_KEY = 'supplierForm_autoMapping';
const STORAGE_KEY_SYSTEM_COLUMNS = 'supplierForm_systemColumns';

/** 기본 칼럼 추가 버튼용 (키, 표시명) */
export const DEFAULT_SYSTEM_COLUMNS = [
  { key: 'orderNo', label: '발주번호' },
  { key: 'orderDate', label: '발주일' },
  { key: 'productCode', label: '상품코드' },
  { key: 'productName', label: '상품명' },
  { key: 'option', label: '옵션' },
  { key: 'qty', label: '수량' },
  { key: 'unitPrice', label: '단가' },
  { key: 'supplyPrice', label: '공급가' },
  { key: 'amount', label: '금액' },
  { key: 'deliveryRequest', label: '납기요청일' },
  { key: 'remark', label: '비고' },
];

/** 기본 규칙 추가 버튼용 */
export const DEFAULT_MAPPING_RULES = {
  발주번호: 'orderNo',
  발주일: 'orderDate',
  상품코드: 'productCode',
  상품명: 'productName',
  옵션: 'option',
  옵션명: 'option',
  수량: 'qty',
  단가: 'unitPrice',
  공급가: 'supplyPrice',
  금액: 'amount',
  납기요청일: 'deliveryRequest',
  비고: 'remark',
  주문번호: 'orderNo',
  품명: 'productName',
  선택사항: 'option',
  qty: 'qty',
  ea: 'qty',
  판매가: 'unitPrice',
  매입가: 'supplyPrice',
  합계: 'amount',
  납기: 'deliveryRequest',
  출고요청일: 'deliveryRequest',
};

/** 사용자 추가 시스템 컬럼 */
export function getCustomSystemColumns() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SYSTEM_COLUMNS);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (_) {
    return [];
  }
}

/** 사용자 시스템 컬럼 저장 */
export function setCustomSystemColumns(columns) {
  try {
    localStorage.setItem(STORAGE_KEY_SYSTEM_COLUMNS, JSON.stringify(Array.isArray(columns) ? columns : []));
  } catch (_) {}
}

/** 시스템 컬럼 (저장된 것만) */
export function getMergedSystemColumns() {
  return getCustomSystemColumns();
}

/** 저장된 매핑 규칙 (없으면 빈 객체) */
export function getCustomExactMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data?.exact && typeof data.exact === 'object' ? data.exact : {};
  } catch (_) {
    return {};
  }
}

/** 매핑 규칙 저장 */
export function setCustomExactMap(exactMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ exact: exactMap || {} }));
  } catch (_) {}
}

/** 매핑에 사용할 규칙 (저장된 것만) */
function getExactMap() {
  return getCustomExactMap();
}

/**
 * 엑셀 컬럼명 배열 → { [excelCol]: { key, confidence } }
 * 자동매핑 설정에 저장된(또는 기본) 규칙만 사용
 */
export function autoMapColumns(excelColumns = []) {
  const exactMap = getExactMap();
  const result = {};

  excelColumns.forEach((col) => {
    const trimmed = (col || '').trim();
    if (!trimmed) {
      result[col] = { key: '', confidence: 'none' };
      return;
    }
    if (exactMap[trimmed]) {
      result[col] = { key: exactMap[trimmed], confidence: 'high' };
      return;
    }
    result[col] = { key: '', confidence: 'none' };
  });

  return result;
}
