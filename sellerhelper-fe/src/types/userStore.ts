/** 사용자 스토어 연결 상태 */
export interface UserStore {
  userStoreId?: number;
  userId?: number;
  storeCode: string;
  isEnabled: boolean;
  authStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  apiToken?: string | null;
  apiRefreshToken?: string | null;
  tokenExpiredAt?: string | null;
  lastSyncAt?: string | null;
}

export const AuthStatus = {
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  ERROR: 'ERROR',
} as const;

export type AuthStatusValue = (typeof AuthStatus)[keyof typeof AuthStatus];
