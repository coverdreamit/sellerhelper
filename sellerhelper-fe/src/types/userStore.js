/**
 * 사용자 스토어 연결 상태
 * @typedef {Object} UserStore
 * @property {number} [userStoreId]
 * @property {number} [userId]
 * @property {string} storeCode
 * @property {boolean} isEnabled
 * @property {('CONNECTED'|'DISCONNECTED'|'ERROR')} authStatus
 * @property {string|null} [apiToken]
 * @property {string|null} [apiRefreshToken]
 * @property {string|null} [tokenExpiredAt]
 * @property {string|null} [lastSyncAt]
 */

/** @type {'CONNECTED'|'DISCONNECTED'|'ERROR'} */
export const AuthStatus = {
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  ERROR: 'ERROR',
};
