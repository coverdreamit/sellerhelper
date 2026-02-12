import { create } from 'zustand';
import { fetchStores } from '@/services';

/**
 * 시스템 스토어 상태 (읽기 위주, 운영자 설정)
 * @typedef {Object} StoreItem
 * @property {string} storeCode
 * @property {string} storeName
 * @property {boolean} isActive
 * @property {boolean} apiRequired
 */
/**
 * @typedef {Object} StoreState
 * @property {StoreItem[]} stores
 * @property {boolean} loading
 * @property {string|null} error
 * @property {function(StoreItem[]): void} setStores
 * @property {function(StoreItem): void} addStore
 * @property {function(): Promise<void>} loadStores
 */
/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<StoreState>>} */
export const useStoreStore = create((set) => ({
  stores: [],
  loading: false,
  error: null,

  setStores: (stores) => set({ stores }),

  /** 데모용: 스토어 직접 추가 (나중에 제거) */
  addStore: (store) =>
    set((state) => ({
      stores: [...state.stores, { isActive: true, ...store }],
    })),

  /** 드래그로 순서 변경 */
  reorderStores: (activeId, overId) =>
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
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },
}));
