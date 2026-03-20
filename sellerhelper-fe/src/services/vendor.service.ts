import { apiFetch } from '@/lib/api';
import type { Vendor } from '@/types';

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

export interface VendorFormTemplatePreview {
  headers: string[];
  rows: string[][];
}

export interface VendorFormTemplateMappingItem {
  excelHeader: string;
  systemKey: string;
}

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

export async function uploadVendorFormTemplate(vendorId: number, file: File): Promise<Vendor> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await apiFetch(`/api/vendors/${vendorId}/form-template`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주 양식 업로드 실패');
  }
  return res.json();
}

export async function downloadVendorFormTemplate(vendorId: number): Promise<{ blob: Blob; fileName: string }> {
  const res = await apiFetch(`/api/vendors/${vendorId}/form-template`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주 양식 다운로드 실패');
  }
  const blob = await res.blob();
  const disposition = res.headers.get('content-disposition') ?? '';
  const match = disposition.match(/filename\*?=(?:UTF-8''|")?([^\";]+)/i);
  const fileName = match?.[1] ? decodeURIComponent(match[1].replace(/"/g, '')) : `vendor-${vendorId}-template.xlsx`;
  return { blob, fileName };
}

export async function fetchVendorFormTemplatePreview(vendorId: number): Promise<VendorFormTemplatePreview> {
  const res = await apiFetch(`/api/vendors/${vendorId}/form-template/preview`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주 그리드 미리보기 조회 실패');
  }
  return res.json();
}

export async function fetchVendorFormTemplateMappings(vendorId: number): Promise<VendorFormTemplateMappingItem[]> {
  const res = await apiFetch(`/api/vendors/${vendorId}/form-template/mappings`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주 칼럼 매핑 조회 실패');
  }
  return res.json();
}

export async function saveVendorFormTemplateMappings(
  vendorId: number,
  mappings: VendorFormTemplateMappingItem[]
): Promise<VendorFormTemplateMappingItem[]> {
  const res = await apiFetch(`/api/vendors/${vendorId}/form-template/mappings`, {
    method: 'PUT',
    body: JSON.stringify({ mappings }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주 칼럼 매핑 저장 실패');
  }
  return res.json();
}
