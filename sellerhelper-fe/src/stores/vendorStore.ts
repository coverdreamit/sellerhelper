import { create } from 'zustand';
import {
  createVendor,
  fetchVendors,
  saveVendorPolicy,
  updateVendor,
  type VendorPolicySaveRequest,
  type VendorSaveRequest,
} from '@/services';
import type { Vendor, VendorPolicy } from '@/types';

interface VendorState {
  vendors: Vendor[];
  selectedVendor?: Vendor;
  loading: boolean;
  error: string | null;
  setVendors: (vendors: Vendor[]) => void;
  loadVendors: () => Promise<void>;
  saveVendor: (payload: VendorSaveRequest) => Promise<Vendor>;
  savePolicy: (vendorId: number, payload: VendorPolicySaveRequest) => Promise<VendorPolicy>;
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

  saveVendor: async (payload: VendorSaveRequest) => {
    const saved = payload.vendorId
      ? await updateVendor(payload.vendorId, payload)
      : await createVendor(payload);
    set((state) => {
      const exists = state.vendors.some((vendor) => vendor.vendorId === saved.vendorId);
      return {
        vendors: exists
          ? state.vendors.map((vendor) => (vendor.vendorId === saved.vendorId ? saved : vendor))
          : [saved, ...state.vendors],
      };
    });
    return saved;
  },

  savePolicy: async (vendorId: number, payload: VendorPolicySaveRequest) => {
    const savedPolicy = await saveVendorPolicy(vendorId, payload);
    set((state) => ({
      vendors: state.vendors.map((vendor) =>
        vendor.vendorId === vendorId ? { ...vendor, policy: savedPolicy } : vendor
      ),
    }));
    return savedPolicy;
  },

  selectVendor: (vendor?: Vendor) => set({ selectedVendor: vendor }),

  toggleVendorStatus: (vendorId: number) =>
    set((state) => ({
      vendors: state.vendors.map((v) =>
        v.vendorId === vendorId ? { ...v, isActive: !v.isActive } : v
      ),
    })),
}));
