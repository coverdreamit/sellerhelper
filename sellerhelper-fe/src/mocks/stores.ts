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
      apiRequired: true,
      isActive: true,
      description: 'Kakao commerce integration',
    },
    {
      storeCode: 'ELEVENTH',
      storeName: '11번가',
      storeType: 'OPEN_MARKET',
      apiRequired: true,
      isActive: true,
      description: '11st marketplace API',
    },
    {
      storeCode: 'GMARKET',
      storeName: 'G마켓',
      storeType: 'OPEN_MARKET',
      apiRequired: true,
      isActive: true,
      description: 'Gmarket seller API',
    },
    {
      storeCode: 'AUCTION',
      storeName: '옥션',
      storeType: 'OPEN_MARKET',
      apiRequired: true,
      isActive: false,
      description: 'Preparing support',
    },
  ],
};
