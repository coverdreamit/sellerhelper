import { create } from 'zustand';
import { fetchStores } from '@/services';

interface StoreItem {
  storeCode: string;
  storeName: string;
  isActive: boolean;
  apiRequired: boolean;
}

interface StoreState {
  stores: StoreItem[];
  loading: boolean;
  error: string | null;
  setStores: (stores: StoreItem[]) => void;
  addStore: (store: Partial<StoreItem>) => void;
  reorderStores: (activeId: string, overId: string) => void;
  loadStores: () => Promise<void>;
}

export const useStoreStore = create<StoreState>((set) => ({
  stores: [],
  loading: false,
  error: null,

  setStores: (stores: StoreItem[]) => set({ stores }),

  addStore: (store: Partial<StoreItem>) =>
    set((state) => ({
      stores: [...state.stores, { isActive: true, apiRequired: false, storeName: '', ...store }] as StoreItem[],
    })),

  /** 드래그로 순서 변경 */
  reorderStores: (activeId: string, overId: string) =>
    set((state) => {
      const ids = state.stores.map((s) => s.storeCode);
      const oldIndex = ids.indexOf(activeId);
      const newIndex = ids.indexOf(overId);
      if (oldIndex === -1 || newIndex === -1) return state;
      const reordered = [...state.stores];
      const [removed] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, removed);
      return { stores: reordered };
    }),

  loadStores: async () => {
    set({ loading: true, error: null });
    try {
      const stores = await fetchStores();
      set({ stores });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));
