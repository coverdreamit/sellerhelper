import { apiFetch } from '@/lib/api';

export interface VendorOrderFormDto {
  formUid: number;
  vendorUid: number;
  vendorName: string;
  formName: string;
  active: boolean;
  columnKeys: string[];
  /** 발주서(엑셀) 라인 컬럼 — 없으면 프론트 기본값 */
  purchaseColumnKeys?: string[];
  updatedAt?: string;
}

export interface VendorOrderFormSavePayload {
  formName: string;
  active: boolean;
  columnKeys: string[];
  purchaseColumnKeys: string[];
}

export async function fetchAllVendorOrderForms(): Promise<VendorOrderFormDto[]> {
  const res = await apiFetch('/api/vendor-order-forms');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주 양식 목록 조회 실패');
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function fetchVendorOrderForms(vendorId: number): Promise<VendorOrderFormDto[]> {
  const res = await apiFetch(`/api/vendors/${vendorId}/order-forms`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주 양식 조회 실패');
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function createVendorOrderForm(
  vendorId: number,
  payload: VendorOrderFormSavePayload
): Promise<VendorOrderFormDto> {
  const res = await apiFetch(`/api/vendors/${vendorId}/order-forms`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주 양식 등록 실패');
  }
  return res.json();
}

export async function updateVendorOrderForm(
  vendorId: number,
  formUid: number,
  payload: VendorOrderFormSavePayload
): Promise<VendorOrderFormDto> {
  const res = await apiFetch(`/api/vendors/${vendorId}/order-forms/${formUid}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주 양식 저장 실패');
  }
  return res.json();
}

export async function deleteVendorOrderForm(vendorId: number, formUid: number): Promise<void> {
  const res = await apiFetch(`/api/vendors/${vendorId}/order-forms/${formUid}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '발주 양식 삭제 실패');
  }
}
