/**
 * 시스템 지원 스토어 mock (STORE 테이블)
 * API 없이 화면·상태관리용
 */
export const storesMock = {
  stores: [
    {
      storeCode: 'NAVER',
      storeName: 'Naver Smart Store',
      storeType: 'OPEN_MARKET',
      apiRequired: true,
      isActive: true,
      description: 'Naver Smart Store official API supported',
    },
    {
      storeCode: 'COUPANG',
      storeName: 'Coupang',
      storeType: 'OPEN_MARKET',
      apiRequired: true,
      isActive: true,
      description: 'Coupang seller API',
    },
    {
      storeCode: 'KAKAO',
      storeName: 'Kakao Shopping',
      storeType: 'SOCIAL',
      apiRequired: false,
      isActive: false,
      description: 'Preparing support',
    },
  ],
};
