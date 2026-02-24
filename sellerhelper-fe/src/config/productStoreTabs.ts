/**
 * 상품 목록 탭 - 스토어 코드별 표시명 및 API 필터값 매핑
 * - 스토어 연동에서 연결된 스토어가 자동으로 탭에 표시됨
 * - tabLabel: 탭에 보여줄 이름
 * - filterValue: 상품 API 응답의 store 필드값과 매칭
 * - columns: 테이블 컬럼 정의 (스토어별로 다를 수 있음)
 * - keyMap: 스토어 API 키 → 셀러헬퍼 표준 키 매핑
 *   (셀러헬퍼 키: name, price, stock, status, imageUrl, updated, displayStatus 등)
 */
const defaultColumns = [
  { key: 'imageUrl', label: '이미지', type: 'image' },
  { key: 'name', label: '상품명', type: 'text' },
  { key: 'store', label: '스토어', type: 'text' },
  { key: 'price', label: '판매가', type: 'price' },
  { key: 'stock', label: '재고', type: 'stock' },
  { key: 'status', label: '상태', type: 'badge' },
  { key: 'updated', label: '수정일', type: 'text' },
];

/** 셀러헬퍼 표준 키 (공통 스키마) */
export const SELLERHELPER_KEYS = ['imageUrl', 'name', 'store', 'price', 'stock', 'status', 'displayStatus', 'updated'];

/**
 * 스토어 API 키 → 셀러헬퍼 표준 키 매핑
 * - key: 셀러헬퍼 표준 키
 * - value: 해당 스토어 API 응답에서 사용하는 키
 * - 매핑 없으면 셀러헬퍼 키 그대로 사용
 */
export const STORE_KEY_MAP = {
  '스마트스토어': {
    imageUrl: 'imageUrl',
    name: 'name',
    price: 'price',
    stock: 'stock',
    status: 'status',
    displayStatus: 'displayStatus',
    updated: 'updated',
  },
  '쿠팡': {
    imageUrl: 'imageUrl',
    name: 'vendorItemName',
    price: 'salePrice',
    stock: 'quantity',
    status: 'saleStatus',
    updated: 'updatedAt',
  },
  '카카오쇼핑': {
    imageUrl: 'imageUrl',
    name: 'productName',
    price: 'price',
    stock: 'stockQuantity',
    status: 'status',
    updated: 'modifiedAt',
  },
  '11번가': {
    imageUrl: 'image',
    name: 'productName',
    price: 'salePrice',
    stock: 'stockQty',
    status: 'saleStatus',
    updated: 'updateDate',
  },
  'G마켓': {
    imageUrl: 'imageUrl',
    name: 'itemName',
    price: 'salePrice',
    stock: 'stock',
    status: 'status',
    updated: 'modified',
  },
  '옥션': {
    imageUrl: 'imgUrl',
    name: 'title',
    price: 'price',
    stock: 'stock',
    status: 'status',
    updated: 'updateDate',
  },
};

/** mallCode -> 탭/필터 설정 (DB Mall.code와 매칭) */
export const STORE_TAB_MAP = {
  NAVER: {
    tabLabel: '스마트스토어',
    filterValue: '스마트스토어',
    columns: [
      { key: 'imageUrl', label: '이미지', type: 'image' },
      { key: 'name', label: '상품명', type: 'text' },
      { key: 'price', label: '판매가', type: 'price' },
      { key: 'stock', label: '재고', type: 'stock' },
      { key: 'status', label: '상태', type: 'badge' },
      { key: 'displayStatus', label: '전시상태', type: 'text' },
      { key: 'updated', label: '수정일', type: 'text' },
    ],
  },
  COUPANG: {
    tabLabel: '쿠팡',
    filterValue: '쿠팡',
    columns: defaultColumns,
  },
  KAKAO: {
    tabLabel: '카카오쇼핑',
    filterValue: '카카오쇼핑',
    columns: defaultColumns,
  },
  ELEVENTH: {
    tabLabel: '11번가',
    filterValue: '11번가',
    columns: defaultColumns,
  },
  '11ST': {
    tabLabel: '11번가',
    filterValue: '11번가',
    columns: defaultColumns,
  },
  GMARKET: {
    tabLabel: 'G마켓',
    filterValue: 'G마켓',
    columns: defaultColumns,
  },
  AUCTION: {
    tabLabel: '옥션',
    filterValue: '옥션',
    columns: defaultColumns,
  },
};

/** 선택된 스토어 탭에 해당하는 컬럼 정의 반환 */
export function getStoreColumns(storeTabKey, storeTabMap = STORE_TAB_MAP) {
  for (const config of Object.values(storeTabMap)) {
    if (config.filterValue === storeTabKey && config.columns) {
      return config.columns;
    }
  }
  return defaultColumns;
}

/**
 * 상품 객체에서 값을 조회 (스토어별 키 매핑 적용)
 * @param {Object} product - 상품 객체 (스토어 API 원본 또는 셀러헬퍼 정규화 데이터)
 * @param {string} sellerHelperKey - 셀러헬퍼 표준 키 (column.key)
 * @param {string} storeTabKey - 현재 스토어 탭 (filterValue)
 * @returns {*} 스토어 API 키 또는 셀러헬퍼 키로 조회한 값 (스토어 키 우선, 없으면 표준 키)
 */
export function getProductValue(product, sellerHelperKey, storeTabKey, keyMap = STORE_KEY_MAP) {
  const storeKeys = keyMap[storeTabKey];
  const storeKey = storeKeys?.[sellerHelperKey];
  const v = storeKey != null ? product[storeKey] : undefined;
  if (v !== undefined && v !== null) return v;
  return product[sellerHelperKey];
}

/** 스토어 탭 아이템 (주문/배송/상품 목록 탭용) */
export interface StoreTabItem {
  /** 고유 키 (React key, 탭 식별) */
  key: string;
  /** 상품 필터용 값 (p.store와 매칭) */
  filterValue: string;
  label: string;
  storeUid: number;
  mallCode: string;
  mallName: string;
}

/** MyStoreItem 형태 - uid, mallCode, mallName, name, enabled, hasAuth */
interface MyStoreLike {
  uid: number;
  mallCode: string;
  mallName: string;
  name: string;
  enabled: boolean;
  hasAuth: boolean;
}

/**
 * 내 스토어 목록으로 탭 생성 (환경설정 > 스토어 연동에서 연동한 스토어)
 * 사용(enabled) 스토어만 순서대로 탭 표시 (연동 여부와 무관)
 * @param myStores - fetchMyStores()로 조회한 내 스토어 목록 (sortOrder 순)
 */
export function buildStoreTabs(
  myStores: MyStoreLike[] = [],
  storeTabMap = STORE_TAB_MAP
): StoreTabItem[] {
  const tabs: StoreTabItem[] = [];
  for (const store of myStores) {
    if (!store.enabled) continue;
    const config = storeTabMap[store.mallCode as keyof typeof storeTabMap];
    const filterValue = config?.filterValue ?? store.mallName;
    tabs.push({
      key: String(store.uid),
      filterValue,
      label: store.name,
      storeUid: store.uid,
      mallCode: store.mallCode,
      mallName: store.mallName,
    });
  }
  return tabs;
}
