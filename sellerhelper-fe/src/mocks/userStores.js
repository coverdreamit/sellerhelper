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
      lastSyncAt: '2026-02-08T14:30:00',
    },
    {
      userStoreId: 2,
      userId: 1001,
      storeCode: 'COUPANG',
      isEnabled: false,
      authStatus: 'DISCONNECTED',
      apiToken: null,
      apiRefreshToken: null,
      tokenExpiredAt: null,
      lastSyncAt: null,
    },
  ],
};
