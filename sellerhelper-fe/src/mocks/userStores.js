/**
 * 사용자 스토어 연결 상태 mock (USER_STORE)
 */
export const userStoresMock = {
  userStores: [
    {
      userStoreId: 1,
      userId: 1001,
      storeCode: 'NAVER',
      isEnabled: true,
      authStatus: 'CONNECTED',
      apiToken: 'encrypted_token_value',
      apiRefreshToken: 'encrypted_refresh_token',
      tokenExpiredAt: '2026-03-01T00:00:00',
      lastSyncAt: '2025-02-11T09:00:00',
    },
    {
      userStoreId: 2,
      userId: 1001,
      storeCode: 'COUPANG',
      isEnabled: true,
      authStatus: 'CONNECTED',
      apiToken: 'encrypted_token_value',
      apiRefreshToken: 'encrypted_refresh_token',
      tokenExpiredAt: '2026-03-01T00:00:00',
      lastSyncAt: '2025-02-11T21:00:00',
    },
  ],
};
