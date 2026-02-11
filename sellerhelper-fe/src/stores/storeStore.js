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
