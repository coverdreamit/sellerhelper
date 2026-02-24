/** 메뉴 아이템 - roles: 접근 가능 권한 코드. 비어있으면 모든 로그인 사용자 */
export interface MenuItem {
  key: string;
  label: string;
  path?: string;
  hidden?: boolean;
  /** 접근 가능 권한 코드 (ADMIN, USER, SELLER, ORDER). [] = 전체 허용 */
  roles?: string[];
  children?: MenuItem[];
}

/** 메뉴 접근 가능 여부: roles가 비어있으면 true, 아니면 userRoleCodes 중 하나라도 있으면 true */
export function canAccessMenuItem(item: MenuItem, userRoleCodes: string[]): boolean {
  if (!item.roles || item.roles.length === 0) return true;
  return item.roles.some((r) => userRoleCodes.includes(r));
}

/** 메뉴를 권한에 따라 필터링 (자식 재귀). 빈 그룹 제거 */
export function filterMenuByRoles(menu: MenuItem[], userRoleCodes: string[]): MenuItem[] {
  return menu
    .filter((item) => canAccessMenuItem(item, userRoleCodes))
    .map((item) => ({
      ...item,
      children: item.children ? filterMenuByRoles(item.children, userRoleCodes) : undefined,
    }))
    .filter(
      (item) => item.path || (item.children && item.children.length > 0)
    );
}

/** 임시 메뉴 구조 (나중에 메뉴관리/코드관리로 동적 변경 예정) */
export const MENU: MenuItem[] = [
  {
    key: 'dashboard',
    label: '대시보드',
    path: '/',
    roles: [],
  },
  {
    key: 'product',
    label: '상품관리',
    path: '/product',
    roles: ['ADMIN', 'USER', 'SELLER', 'ORDER'],
    children: [{ key: 'product-list', label: '상품 목록', path: '/product/list' }],
  },
  {
    key: 'order',
    label: '주문관리',
    path: '/order',
    roles: ['ADMIN', 'USER', 'SELLER', 'ORDER'],
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
    roles: ['ADMIN', 'USER', 'SELLER', 'ORDER'],
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
    roles: ['ADMIN', 'USER', 'SELLER', 'ORDER'],
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
    roles: ['ADMIN', 'USER', 'SELLER', 'ORDER'],
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
    roles: [],
    children: [
      {
        key: 'settings-basic',
        label: '기본 설정',
        path: '/settings/basic',
        children: [
          { key: 'settings-company', label: '회사 / 셀러 정보', path: '/settings/basic/company' },
          {
            key: 'settings-notification',
            label: '알림 설정',
            path: '/settings/basic/notification',
          },
        ],
      },
      {
        key: 'settings-store',
        label: '스토어 설정',
        path: '/settings/store/list',
        children: [
          { key: 'settings-store-list', label: '스토어 연동', path: '/settings/store/list' },
        ],
      },
      { key: 'settings-user-log', label: '사용자 로그', path: '/settings/user-log' },
      {
        key: 'settings-supplier',
        label: '발주업체 관리',
        path: '/settings/supplier/list',
        children: [
          {
            key: 'settings-supplier-list',
            label: '발주업체 목록',
            path: '/settings/supplier/list',
          },
          {
            key: 'settings-supplier-form',
            label: '발주양식 관리',
            path: '/settings/supplier/forms',
          },
        ],
      },
    ],
  },
  {
    key: 'system',
    label: '시스템관리 (운영자)',
    path: '/system',
    roles: ['ADMIN'],
    children: [
      { key: 'system-user', label: '사용자 관리', path: '/system/user', roles: ['ADMIN'] },
      { key: 'system-store', label: '스토어 관리', path: '/system/store', roles: ['ADMIN'] },
      { key: 'system-batch', label: '배치 관리', path: '/system/batch', roles: ['ADMIN'] },
      {
        key: 'system-code',
        label: '코드 관리',
        path: '/system/code',
        roles: ['ADMIN'],
        children: [],
      },
      { key: 'system-log', label: '로그 / 이력 관리', path: '/system/log', roles: ['ADMIN'] },
      { key: 'system-setting', label: '시스템 설정', path: '/system/setting', roles: ['ADMIN'] },
    ],
  },
];

/** pathname 접근 가능 여부. 가장 긴 매칭 경로의 roles로 판단 */
export function canAccessPath(pathname: string, userRoleCodes: string[]): boolean {
  if (!pathname || pathname === '/') return true;
  let best: { path: string; roles: string[] } | null = null;
  function walk(m: MenuItem[]) {
    for (const node of m) {
      if (node.path && (pathname === node.path || pathname.startsWith(node.path + '/'))) {
        if (!best || node.path.length > best.path.length) {
          best = { path: node.path, roles: node.roles ?? [] };
        }
      }
      if (node.children) walk(node.children);
    }
  }
  walk(MENU);
  if (!best) return true;
  if (best.roles.length === 0) return true;
  return best.roles.some((r) => userRoleCodes.includes(r));
}
