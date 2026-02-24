import { create } from 'zustand';
import { fetchMyStores, type MyStoreItem } from '@/services';

interface MyStoreState {
  myStores: MyStoreItem[];
  loading: boolean;
  error: string | null;
  loadMyStores: () => Promise<void>;
}

export const useMyStoreStore = create<MyStoreState>((set) => ({
  myStores: [],
  loading: false,
  error: null,
  loadMyStores: async () => {
    set({ loading: true, error: null });
    try {
      const list = await fetchMyStores();
      set({ myStores: list });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : '스토어 목록 조회 실패',
        myStores: [],
      });
    } finally {
      set({ loading: false });
    }
  },
}));
