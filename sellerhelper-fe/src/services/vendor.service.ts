import { apiFetch } from '@/lib/api';
import type { Vendor, VendorPolicy } from '@/types';

export interface VendorSaveRequest {
  vendorId?: number;
  vendorName: string;
  bizNo?: string;
  managerName?: string;
  address?: string;
  addressDetail?: string;
  phone?: string;
  email?: string;
  memo?: string;
  isActive: boolean;
}

export interface VendorPolicySaveRequest extends VendorPolicy {}

export async function fetchVendors(): Promise<Vendor[]> {
  const res = await apiFetch('/api/vendors');
  if (!res.ok) throw new Error('발주업체 목록 조회 실패');
  const data = await res.json();
  return Array.isArray(data) ? data : data.vendors ?? [];
}

export async function createVendor(req: VendorSaveRequest): Promise<Vendor> {
  const res = await apiFetch('/api/vendors', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주업체 등록 실패');
  }
  return res.json();
}

export async function updateVendor(vendorId: number, req: VendorSaveRequest): Promise<Vendor> {
  const res = await apiFetch(`/api/vendors/${vendorId}`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주업체 수정 실패');
  }
  return res.json();
}

export async function saveVendorPolicy(
  vendorId: number,
  req: VendorPolicySaveRequest
): Promise<VendorPolicy> {
  const res = await apiFetch(`/api/vendors/${vendorId}/policy`, {
    method: 'PUT',
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주정책 저장 실패');
  }
  return res.json();
}
