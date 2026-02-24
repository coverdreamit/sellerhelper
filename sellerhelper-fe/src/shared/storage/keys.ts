/**
 * Storage 키 상수 - 프로젝트 prefix(sellerhelper_)는 옵션
 */

export const STORAGE_KEYS = {
  /** 로그인 아이디 저장 (비밀번호 저장 금지) */
  REMEMBER_LOGIN_ID: 'sellerhelper_remember_login_id',
  /** 사이드바 접힘 여부 (기존 sidebar_collapsed 호환) */
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  /** 메뉴 닫힌 키 목록 (쉼표 구분, 기존 menu_closed_keys 호환) */
  MENU_CLOSED_KEYS: 'menu_closed_keys',
} as const;
