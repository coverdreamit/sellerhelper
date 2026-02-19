/** 시스템 지원 스토어 (운영자/시스템 관리) */
export interface Store {
  storeCode: string; // NAVER, COUPANG ...
  storeName: string;
  storeType: 'OPEN_MARKET' | 'SOCIAL' | 'ETC';
  apiRequired: boolean;
  isActive: boolean;
  description?: string;
}

export const StoreType = {
  OPEN_MARKET: 'OPEN_MARKET',
  SOCIAL: 'SOCIAL',
  ETC: 'ETC',
} as const;

export type StoreTypeValue = (typeof StoreType)[keyof typeof StoreType];
