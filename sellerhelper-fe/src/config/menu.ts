/** 메뉴 아이템 - menuKeys 기반 접근 제어 (권한 관리에서 역할별 메뉴 설정) */
export interface MenuItem {
  key: string;
  label: string;
  path?: string;
  hidden?: boolean;
  children?: MenuItem[];
}

/** 메뉴 접근 가능 여부: userMenuKeys에 item.key가 있으면 true */
export function canAccessMenuItem(item: MenuItem, userMenuKeys: string[]): boolean {
  if (!userMenuKeys || userMenuKeys.length === 0) return false;
  return userMenuKeys.includes(item.key);
}

/** 메뉴를 권한(menuKeys)에 따라 필터링 (자식 재귀). 빈 그룹 제거 */
export function filterMenuByRoles(menu: MenuItem[], userMenuKeys: string[]): MenuItem[] {
  return menu
    .filter((item) => canAccessMenuItem(item, userMenuKeys))
    .map((item) => ({
      ...item,
      children: item.children ? filterMenuByRoles(item.children, userMenuKeys) : undefined,
    }))
    .filter(
      (item) => item.path || (item.children && item.children.length > 0)
    );
}

/** 메뉴 트리에서 모든 key 수집 (권한 편집용) */
export function collectAllMenuKeys(menu: MenuItem[]): { key: string; label: string }[] {
  const result: { key: string; label: string }[] = [];
  function walk(items: MenuItem[]) {
    for (const item of items) {
      result.push({ key: item.key, label: item.label });
      if (item.children?.length) walk(item.children);
    }
  }
  walk(menu);
  return result;
}

/** 메뉴 구조 (권한 관리에서 역할별 메뉴 키 할당) */
export const MENU: MenuItem[] = [
  { key: 'dashboard', label: '대시보드', path: '/' },
  {
    key: 'product',
    label: '상품관리',
    path: '/product',
    children: [{ key: 'product-list', label: '상품 목록', path: '/product/list' }],
  },
  {
    key: 'order',
    label: '주문관리',
    path: '/order',
    children: [
      { key: 'order-list', label: '주문 목록', path: '/order/list' },
      { key: 'order-processing', label: '처리중 주문', path: '/order/processing' },
      { key: 'order-claim', label: '취소 / 반품 / 교환', path: '/order/claim' },
    ],
  },
  {
    key: 'shipping',
    label: '배송관리',
    path: '/shipping',
    children: [
      { key: 'shipping-list', label: '배송 목록', path: '/shipping/list' },
      { key: 'shipping-pending', label: '출고 대기', path: '/shipping/pending' },
      { key: 'shipping-transit', label: '배송중', path: '/shipping/transit' },
      { key: 'shipping-complete', label: '배송 완료', path: '/shipping/complete' },
    ],
  },
  {
    key: 'sales',
    label: '정산관리',
    path: '/sales',
    children: [
      { key: 'sales-status', label: '매출 현황', path: '/sales/status' },
      { key: 'sales-confirmation', label: '구매확정 관리', path: '/sales/confirmation' },
      { key: 'sales-settlement', label: '정산 내역', path: '/sales/settlement' },
    ],
  },
  {
    key: 'customer',
    label: '고객관리(예정)',
    hidden: true,
    path: '/customer',
    children: [
      { key: 'customer-list', label: '고객 목록', path: '/customer/list' },
      { key: 'customer-inquiry', label: '문의 관리', path: '/customer/inquiry' },
      { key: 'customer-claim', label: '클레임 관리', path: '/customer/claim' },
    ],
  },
  {
    key: 'settings',
    label: '환경설정',
    path: '/settings',
    children: [
      {
        key: 'settings-basic',
        label: '기본 설정',
        path: '/settings/basic',
        children: [
          { key: 'settings-company', label: '회사 / 셀러 정보', path: '/settings/basic/company' },
          { key: 'settings-notification', label: '알림 설정', path: '/settings/basic/notification' },
        ],
      },
      {
        key: 'settings-store',
        label: '스토어 설정',
        path: '/settings/store/list',
        children: [{ key: 'settings-store-list', label: '스토어 연동', path: '/settings/store/list' }],
      },
      { key: 'settings-user-log', label: '사용자 로그', path: '/settings/user-log' },
      {
        key: 'settings-supplier',
        label: '발주업체 관리',
        path: '/settings/supplier/list',
        children: [
          { key: 'settings-supplier-list', label: '발주업체 목록', path: '/settings/supplier/list' },
          { key: 'settings-supplier-form', label: '발주양식 관리', path: '/settings/supplier/forms' },
        ],
      },
    ],
  },
  {
    key: 'system',
    label: '시스템관리 (운영자)',
    path: '/system',
    children: [
      { key: 'system-user', label: '사용자 관리', path: '/system/user' },
      { key: 'system-role', label: '권한 관리', path: '/system/role' },
      { key: 'system-store', label: '스토어 관리', path: '/system/store' },
      { key: 'system-batch', label: '배치 관리', path: '/system/batch' },
      { key: 'system-code', label: '코드 관리', path: '/system/code', children: [] },
      { key: 'system-log', label: '로그 / 이력 관리', path: '/system/log' },
      { key: 'system-setting', label: '시스템 설정', path: '/system/setting' },
    ],
  },
];

/** pathname 접근 가능 여부. 가장 긴 매칭 경로의 key가 userMenuKeys에 있으면 true */
export function canAccessPath(pathname: string, userMenuKeys: string[]): boolean {
  if (!pathname || pathname === '/') return true;
  let best: { path: string; key: string } | null = null;
  function walk(m: MenuItem[]) {
    for (const node of m) {
      if (node.path && (pathname === node.path || pathname.startsWith(node.path + '/'))) {
        if (!best || node.path.length > best.path.length) {
          best = { path: node.path, key: node.key };
        }
      }
      if (node.children) walk(node.children);
    }
  }
  walk(MENU);
  if (!best) return true;
  return userMenuKeys?.includes(best.key) ?? false;
}
