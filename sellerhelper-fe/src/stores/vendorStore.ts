import { create } from 'zustand';
import { fetchVendors } from '@/services';
import type { Vendor } from '@/types';

interface VendorState {
  vendors: Vendor[];
  selectedVendor?: Vendor;
  loading: boolean;
  error: string | null;
  setVendors: (vendors: Vendor[]) => void;
  loadVendors: () => Promise<void>;
  selectVendor: (vendor?: Vendor) => void;
  toggleVendorStatus: (vendorId: number) => void;
}

export const useVendorStore = create<VendorState>((set) => ({
  vendors: [],
  selectedVendor: undefined,
  loading: false,
  error: null,

  setVendors: (vendors: Vendor[]) => set({ vendors }),

  loadVendors: async () => {
    set({ loading: true, error: null });
    try {
      const vendors = await fetchVendors();
      set({ vendors });
    } catch (e: unknown) {
      set({ error: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  selectVendor: (vendor?: Vendor) => set({ selectedVendor: vendor }),

  toggleVendorStatus: (vendorId: number) =>
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.vendorId === vendorId ? { ...v, isActive: !v.isActive } : v
      ),
    })),
}));
