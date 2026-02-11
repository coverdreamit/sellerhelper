/**
 * 임시 메뉴 구조 (나중에 메뉴관리/코드관리로 동적 변경 예정)
 */
export const MENU = [
  {
    key: 'dashboard',
    label: '대시보드',
    path: '/',
    children: [{ key: 'dashboard', label: '대시보드', path: '/' }],
  },
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
      { key: 'shipping-complete', label: '과거 배송 목록', path: '/shipping/complete' },
    ],
  },
  {
    key: 'sales',
    label: '정산·매출(예정)',
    path: '/sales',
    children: [
      { key: 'sales-status', label: '매출 현황', path: '/sales/status' },
      { key: 'sales-settlement', label: '정산 내역', path: '/sales/settlement' },
      { key: 'sales-store', label: '스토어별 매출', path: '/sales/store' },
      { key: 'sales-period', label: '기간별 매출 통계', path: '/sales/period' },
    ],
  },
  {
    key: 'customer',
    label: '고객관리(예정)',
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
          { key: 'settings-policy', label: '기본 정책 설정', path: '/settings/basic/policy' },
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
          { key: 'settings-store-list', label: '스토어 관리', path: '/settings/store/list' },
          { key: 'settings-store-batch', label: '배치 관리', path: '/settings/store/batch' },
        ],
      },
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
    children: [
      { key: 'system-user', label: '사용자 관리', path: '/system/user' },
      { key: 'system-store', label: '스토어 관리', path: '/system/store' },
      {
        key: 'system-code',
        label: '코드 관리',
        path: '/system/code',
        children: [],
      },
      { key: 'system-log', label: '로그 / 이력 관리', path: '/system/log' },
      { key: 'system-setting', label: '시스템 설정', path: '/system/setting' },
    ],
  },
];
