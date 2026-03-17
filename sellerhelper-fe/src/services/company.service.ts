/** 회사 API 서비스 */
import { apiFetch } from '@/lib/api';

export interface CompanyItem {
  uid: number;
  name: string;
  businessNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  ceoName?: string;
  businessDocumentName?: string;
  businessDocumentUploaded?: boolean;
}

export async function fetchCompanies(): Promise<CompanyItem[]> {
  const res = await apiFetch('/api/companies');
  if (!res.ok) throw new Error('회사 목록 조회 실패');
  const data = await res.json();
  return Array.isArray(data) ? data : data.companies ?? [];
}

/** 내 회사 조회 */
export async function fetchMyCompany(): Promise<CompanyItem | null> {
  const res = await apiFetch('/api/my-company');
  if (res.status === 204) return null;
  if (!res.ok) throw new Error('내 회사 조회 실패');
  return res.json();
}

export interface CompanyCreateRequest {
  name: string;
  businessNumber?: string;
  address?: string;
  phone?: string;
  email?: string;
  ceoName?: string;
}

/** 내 회사 등록 (회사 미등록 시 1회만) */
export async function createMyCompany(req: CompanyCreateRequest, businessDocument: File): Promise<CompanyItem> {
  const formData = new FormData();
  formData.append('name', req.name);
  if (req.businessNumber) formData.append('businessNumber', req.businessNumber);
  if (req.address) formData.append('address', req.address);
  if (req.phone) formData.append('phone', req.phone);
  if (req.email) formData.append('email', req.email);
  if (req.ceoName) formData.append('ceoName', req.ceoName);
  formData.append('businessDocument', businessDocument);

  const res = await apiFetch('/api/my-company', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '회사 등록에 실패했습니다.');
  }
  return res.json();
}
