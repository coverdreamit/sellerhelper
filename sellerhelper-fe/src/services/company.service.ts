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
  businessLicenseFileName?: string;
  businessLicenseContentType?: string;
  hasBusinessLicenseFile?: boolean;
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
export async function createMyCompany(
  req: CompanyCreateRequest,
  businessLicenseFile?: File | null
): Promise<CompanyItem> {
  const body = toCompanyFormData(req, businessLicenseFile);
  const res = await apiFetch('/api/my-company', {
    method: 'POST',
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '회사 등록에 실패했습니다.');
  }
  return res.json();
}

/** 내 회사 수정 */
export async function updateMyCompany(
  req: CompanyCreateRequest,
  businessLicenseFile?: File | null
): Promise<CompanyItem> {
  const body = toCompanyFormData(req, businessLicenseFile);
  const res = await apiFetch('/api/my-company', {
    method: 'PUT',
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '회사 정보 수정에 실패했습니다.');
  }
  return res.json();
}

export interface BusinessLicensePreviewData {
  blob: Blob;
  contentType: string;
  fileName?: string;
}

/** 내 사업자등록증 미리보기 파일 조회 */
export async function fetchMyBusinessLicensePreview(): Promise<BusinessLicensePreviewData> {
  const res = await apiFetch('/api/my-company/business-license');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '사업자등록증 파일 조회에 실패했습니다.');
  }
  const blob = await res.blob();
  const contentType = res.headers.get('content-type') ?? 'application/octet-stream';
  const fileName = extractFileNameFromDisposition(res.headers.get('content-disposition'));
  return { blob, contentType, fileName };
}

function toCompanyFormData(req: CompanyCreateRequest, businessLicenseFile?: File | null): FormData {
  const formData = new FormData();
  formData.append('name', req.name ?? '');
  formData.append('businessNumber', req.businessNumber ?? '');
  formData.append('address', req.address ?? '');
  formData.append('phone', req.phone ?? '');
  formData.append('email', req.email ?? '');
  formData.append('ceoName', req.ceoName ?? '');
  if (businessLicenseFile) {
    formData.append('businessLicenseFile', businessLicenseFile);
  }
  return formData;
}

function extractFileNameFromDisposition(disposition: string | null): string | undefined {
  if (!disposition) return undefined;
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1]);
    } catch {
      return utf8Match[1];
    }
  }
  const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
  return plainMatch?.[1];
}
