import { create } from 'zustand';
import { fetchUserStores } from '@/services';

/**
 * 사용자 스토어 연결 상태 (핵심)
 * @typedef {Object} UserStoreItem
 * @property {string} storeCode
 * @property {boolean} isEnabled
 * @property {('CONNECTED'|'DISCONNECTED'|'ERROR')} authStatus
 * @property {string} [lastSyncAt]
 */
/**
 * @typedef {Object} UserStoreState
 * @property {UserStoreItem[]} userStores
 * @property {boolean} loading
 * @property {string|null} error
 * @property {function(UserStoreItem[]): void} setUserStores
 * @property {function(): Promise<void>} loadUserStores
 * @property {function(string, Object?): void} connectStore
 * @property {function(string): void} disconnectStore
 * @property {function(string, boolean): void} toggleEnable
 */
/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<UserStoreState>>} */
export const useUserStoreStore = create((set) => ({
  userStores: [],
  loading: false,
  error: null,

  setUserStores: (userStores) => set({ userStores }),

  loadUserStores: async () => {
    set({ loading: true, error: null });
    try {
      const list = await fetchUserStores();
      const userStores = list.map((us) => ({
        storeCode: us.storeCode,
        isEnabled: us.isEnabled,
        authStatus: us.authStatus,
        lastSyncAt: us.lastSyncAt ?? undefined,
      }));
      set({ userStores });
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  connectStore: (storeCode) =>
    set((state) => ({
      userStores: [
        ...state.userStores.filter((s) => s.storeCode !== storeCode),
        {
          storeCode,
          isEnabled: true,
          authStatus: 'CONNECTED',
          lastSyncAt: new Date().toISOString(),
        },
      ],
    })),

  disconnectStore: (storeCode) =>
    set((state) => ({
      userStores: state.userStores.filter((s) => s.storeCode !== storeCode),
    })),

  toggleEnable: (storeCode, enabled) =>
    set((state) => ({
      userStores: state.userStores.map((s) =>
        s.storeCode === storeCode ? { ...s, isEnabled: enabled } : s
      ),
    })),
}));
