import { create } from 'zustand';
import { fetchVendors } from '@/services';

/**
 * 발주업체 상태
 * @typedef {Object} VendorItem
 * @property {number} vendorId
 * @property {string} vendorName
 * @property {('EMAIL'|'EXCEL'|'API'|'ETC')} orderMethod
 * @property {('DIRECT'|'CONSIGNMENT'|'MIXED')} shippingType
 * @property {boolean} isActive
 * @property {string} [managerName]
 * @property {string} [phone]
 * @property {string} [email]
 * @property {string} [memo]
 */
/**
 * @typedef {Object} VendorState
 * @property {VendorItem[]} vendors
 * @property {VendorItem|undefined} selectedVendor
 * @property {boolean} loading
 * @property {string|null} error
 * @property {function(VendorItem[]): void} setVendors
 * @property {function(): Promise<void>} loadVendors
 * @property {function(VendorItem): void} selectVendor
 * @property {function(number): void} toggleVendorStatus
 */
/** @type {import('zustand').UseBoundStore<import('zustand').StoreApi<VendorState>>} */
export const useVendorStore = create((set) => ({
  vendors: [],
  selectedVendor: undefined,
  loading: false,
  error: null,

  setVendors: (vendors) => set({ vendors }),

  loadVendors: async () => {
    set({ loading: true, error: null });
    try {
      const vendors = await fetchVendors();
      set({ vendors });
    } catch (e) {
      set({ error: e.message });
    } finally {
      set({ loading: false });
    }
  },

  selectVendor: (vendor) => set({ selectedVendor: vendor }),

  toggleVendorStatus: (vendorId) =>
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.vendorId === vendorId ? { ...v, isActive: !v.isActive } : v
      ),
    })),
}));
