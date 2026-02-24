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
}

export async function fetchCompanies(): Promise<CompanyItem[]> {
  const res = await apiFetch('/api/companies');
  if (!res.ok) throw new Error('회사 목록 조회 실패');
  const data = await res.json();
  return Array.isArray(data) ? data : data.companies ?? [];
}
