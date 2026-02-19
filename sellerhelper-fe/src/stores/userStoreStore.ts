import { create } from 'zustand';
import { fetchUserStores } from '@/services';

interface UserStoreItem {
  storeCode: string;
  isEnabled: boolean;
  authStatus: 'CONNECTED' | 'DISCONNECTED' | 'ERROR';
  lastSyncAt?: string;
}

interface UserStoreState {
  userStores: UserStoreItem[];
  loading: boolean;
  error: string | null;
  setUserStores: (userStores: UserStoreItem[]) => void;
  loadUserStores: () => Promise<void>;
  connectStore: (storeCode: string) => void;
  disconnectStore: (storeCode: string) => void;
  toggleEnable: (storeCode: string, enabled: boolean) => void;
}

export const useUserStoreStore = create<UserStoreState>((set) => ({
  userStores: [],
  loading: false,
  error: null,

  setUserStores: (userStores: UserStoreItem[]) => set({ userStores }),

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
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  connectStore: (storeCode: string) =>
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

  disconnectStore: (storeCode: string) =>
    set((state) => ({
      userStores: state.userStores.filter((s) => s.storeCode !== storeCode),
    })),

  toggleEnable: (storeCode: string, enabled: boolean) =>
    set((state) => ({
      userStores: state.userStores.map((s) =>
        s.storeCode === storeCode ? { ...s, isEnabled: enabled } : s
      ),
    })),
}));
