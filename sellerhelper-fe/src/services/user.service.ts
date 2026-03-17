/**
 * 사용자 관리 서비스 - BE /api/users 연동
 */
import { apiFetch } from '@/lib/api';

export interface UserListItem {
  uid: number;
  loginId: string;
  name: string;
  email: string | null;
  roleNames: string | null;
  enabled: boolean;
  lastLoginAt: string | null;
  createdAt?: string | null;
  companyName?: string | null;
  businessDocumentUploaded?: boolean;
  approvalStatus?: string | null;
}

export interface UserListParams {
  keyword?: string;
  roleCode?: string;
  enabled?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface UserResponse {
  uid: number;
  loginId: string;
  name: string;
  email: string | null;
  phone: string | null;
  enabled: boolean;
  lastLoginAt: string | null;
  createdAt: string | null;
  roleCodes: string[];
  roleNames: string[];
  companyName?: string | null;
  businessNumber?: string | null;
  businessDocumentUploaded?: boolean;
  businessDocumentName?: string | null;
  approvalStatus?: string | null;
}

export interface RoleItem {
  uid: number;
  code: string;
  name: string;
  description: string | null;
  menuKeys?: string[];
}

export interface UserUpdateRequest {
  name?: string;
  email?: string;
  phone?: string;
  enabled?: boolean;
  password?: string;
  roleUids?: number[];
}

export interface UserPageResponse {
  content: UserListItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

/** 데모 사용자 10명 생성 (개발 모드 전용) */
export async function createDemoUsers(): Promise<{ created: number; message: string }> {
  const res = await apiFetch('/api/users/demo', { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '데모 사용자 생성에 실패했습니다.');
  }
  return res.json();
}

/** admin 제외 사용자 전체 초기화 (개발 모드 전용) */
export async function resetUsersExceptAdmin(): Promise<{ deleted: number; message: string }> {
  const res = await apiFetch('/api/users/reset', { method: 'POST' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '사용자 초기화에 실패했습니다.');
  }
  return res.json();
}

export async function fetchUserList(params: UserListParams = {}): Promise<UserPageResponse> {
  const searchParams = new URLSearchParams();
  if (params.keyword) searchParams.set('keyword', params.keyword);
  if (params.roleCode) searchParams.set('roleCode', params.roleCode);
  if (params.enabled !== undefined) searchParams.set('enabled', String(params.enabled));
  searchParams.set('page', String(params.page ?? 0));
  searchParams.set('size', String(params.size ?? 20));
  searchParams.set('sortBy', params.sortBy ?? 'uid');
  searchParams.set('sortDir', params.sortDir ?? 'DESC');

  const res = await apiFetch(`/api/users?${searchParams}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '사용자 목록 조회에 실패했습니다.');
  }
  return res.json();
}

/** 승인 대기 사용자 목록 */
export async function fetchPendingUsers(): Promise<UserPageResponse> {
  return fetchUserList({ enabled: false, size: 100 });
}

/** 사용자 단건 조회 */
export async function fetchUser(uid: number): Promise<UserResponse> {
  const res = await apiFetch(`/api/users/${uid}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '사용자 조회에 실패했습니다.');
  }
  return res.json();
}

/** 권한 목록 조회 */
export async function fetchRoles(): Promise<RoleItem[]> {
  const res = await apiFetch('/api/roles');
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '권한 목록 조회에 실패했습니다.');
  }
  return res.json();
}

/** 권한 단건 조회 */
export async function fetchRole(uid: number): Promise<RoleItem> {
  const res = await apiFetch(`/api/roles/${uid}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '권한 조회에 실패했습니다.');
  }
  return res.json();
}

/** 권한 생성 */
export async function createRole(data: {
  code: string;
  name: string;
  description?: string;
  menuKeys?: string[];
}): Promise<RoleItem> {
  const res = await apiFetch('/api/roles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '권한 생성에 실패했습니다.');
  }
  return res.json();
}

/** 권한 수정 */
export async function updateRole(
  uid: number,
  data: { name?: string; description?: string; menuKeys?: string[] }
): Promise<RoleItem> {
  const res = await apiFetch(`/api/roles/${uid}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '권한 수정에 실패했습니다.');
  }
  return res.json();
}

/** 권한 삭제 */
export async function deleteRole(uid: number): Promise<void> {
  const res = await apiFetch(`/api/roles/${uid}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '권한 삭제에 실패했습니다.');
  }
}

export interface UserCreateRequest {
  loginId: string;
  password: string;
  name: string;
  email?: string;
  phone?: string;
  enabled?: boolean;
  roleUids?: number[];
}

/** 사용자 생성 */
export async function createUser(data: UserCreateRequest): Promise<UserResponse> {
  const res = await apiFetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '사용자 등록에 실패했습니다.');
  }
  return res.json();
}

/** 사용자 수정 (승인 시 enabled: true) */
export async function updateUser(uid: number, data: UserUpdateRequest): Promise<void> {
  const res = await apiFetch(`/api/users/${uid}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '사용자 수정에 실패했습니다.');
  }
}

/** 사용자 삭제 (거절 시) */
export async function deleteUser(uid: number): Promise<void> {
  const res = await apiFetch(`/api/users/${uid}`, { method: 'DELETE' });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '사용자 삭제에 실패했습니다.');
  }
}

/** 관리자용 사업자등록증명서 다운로드 */
export async function downloadUserBusinessDocument(uid: number): Promise<void> {
  const res = await apiFetch(`/api/users/${uid}/business-document`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message ?? '사업자등록증명서 다운로드에 실패했습니다.');
  }
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const disposition = res.headers.get('Content-Disposition') ?? '';
  const filenameMatch = disposition.match(/filename="([^"]+)"/);
  const filename = filenameMatch?.[1] ?? `business-document-${uid}`;
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}
