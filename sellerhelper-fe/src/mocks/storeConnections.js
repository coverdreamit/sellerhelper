/**
 * STORE + USER_STORE 합친 화면용 데이터
 * 스토어 연결 화면 / 대시보드 "연결된 스토어" / 설정 페이지용
 */
export const storeConnectionsMock = {
  storeConnections: [
    {
      storeCode: 'NAVER',
      storeName: 'Naver Smart Store',
      apiRequired: true,
      isActive: true,
      userStore: {
        isEnabled: true,
        authStatus: 'CONNECTED',
        lastSyncAt: '2026-02-08T14:30:00',
      },
    },
    {
      storeCode: 'COUPANG',
      storeName: 'Coupang',
      apiRequired: true,
      isActive: true,
      userStore: {
        isEnabled: false,
        authStatus: 'DISCONNECTED',
        lastSyncAt: null,
      },
    },
    {
      storeCode: 'KAKAO',
      storeName: 'Kakao Shopping',
      apiRequired: false,
      isActive: false,
      userStore: null,
    },
  ],
};
