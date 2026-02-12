/**
 * 상품 목록 탭 - 스토어 코드별 표시명 및 API 필터값 매핑
 * - 스토어 관리(연동)에서 연결된 스토어가 자동으로 탭에 표시됨
 * - tabLabel: 탭에 보여줄 이름
 * - filterValue: 상품 API 응답의 store 필드값과 매칭
 */
export const STORE_TAB_MAP = {
  NAVER: { tabLabel: '스마트스토어', filterValue: '스마트스토어' },
  COUPANG: { tabLabel: '쿠팡', filterValue: '쿠팡' },
  KAKAO: { tabLabel: '카카오쇼핑', filterValue: '카카오쇼핑' },
  ELEVENTH: { tabLabel: '11번가', filterValue: '11번가' },
  GMARKET: { tabLabel: 'G마켓', filterValue: 'G마켓' },
  AUCTION: { tabLabel: '옥션', filterValue: '옥션' },
};

/**
 * @param {Object} params
 * @param {Array<{storeCode: string}>} params.stores - 스토어 관리 순서(드래그로 변경 가능)
 * @param {Array<{storeCode: string, isEnabled: boolean, authStatus: string}>} params.userStores - 연동 상태
 */
export function buildStoreTabs({ stores = [], userStores = [] }, storeTabMap = STORE_TAB_MAP) {
  const tabs = [{ key: '', label: '전체' }];
  const connectedSet = new Set(
    userStores
      .filter((us) => us.isEnabled && us.authStatus === 'CONNECTED')
      .map((us) => us.storeCode)
  );
  for (const store of stores) {
    if (connectedSet.has(store.storeCode)) {
      const config = storeTabMap[store.storeCode];
      if (config) {
        tabs.push({
          key: config.filterValue,
          label: config.tabLabel,
          storeCode: store.storeCode,
        });
      }
    }
  }
  return tabs;
}
