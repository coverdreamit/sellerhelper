/**
 * 인증 서비스 - JWT 기반 로그인/회원가입
 * BE(5001) /api/auth/* 직접 호출 (프록시 없음). 비밀번호 저장 금지 → 아이디만 localStorage 저장
 */

import { storage } from '@/shared/storage/storage';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { useAuthStore } from '@/stores';
import { getApiBase } from '@/lib/api';

function authHeaders(): Record<string, string> {
  const token = useAuthStore.getState().user?.token;
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

const baseFetchOptions: RequestInit = {
  credentials: 'include',
};

/** fetch 네트워크 실패 시 브라우저가 주는 영문 메시지 → 한글 안내 */
export function messageFromAuthError(err: unknown, fallback: string): string {
  if (!(err instanceof Error)) return fallback;
  const m = err.message;
  if (
    m === 'Failed to fetch' ||
    m === 'NetworkError when attempting to fetch resource.' ||
    m === 'Load failed'
  ) {
    return '서버에 연결할 수 없습니다. 네트워크와 API 주소를 확인해 주세요.';
  }
  return m;
}

/** 서버가 HTML 에러 페이지를 반환할 경우 res.json() 대신 사용 */
async function parseJsonOrThrow<T>(res: Response): Promise<T> {
  const text = await res.text();
  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    throw new Error(
      res.ok ? '서버 응답 형식 오류' : `서버 오류 (${res.status}). 잠시 후 다시 시도해 주세요.`
    );
  }
}

export interface LoginRequest {
  loginId: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  /** JWT (Bearer) - API 호출 시 Authorization 헤더에 사용 */
  token?: string | null;
  uid: number;
  loginId: string;
  name: string;
  roleCodes: string[];
  /** 사용자 권한들의 메뉴 접근 키 합집합 */
  menuKeys?: string[];
  /** 소속 회사 UID (null이면 회사 정보 미등록 → 회사 등록 페이지로 리다이렉트) */
  companyUid?: number | null;
}

export interface RegisterRequest {
  name: string;
  loginId: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
}

export interface RegisterResponse {
  uid: number;
  loginId: string;
  name: string;
  approved: boolean;
}

export async function login(req: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${getApiBase()}/api/auth/login`, {
    ...baseFetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      loginId: req.loginId,
      password: req.password,
      rememberMe: req.rememberMe ?? false,
    }),
  });
  const data = await parseJsonOrThrow<{ message?: string } & LoginResponse>(res);
  if (!res.ok) {
    throw new Error(data?.message ?? '로그인에 실패했습니다.');
  }
  return data;
}

export async function register(req: RegisterRequest): Promise<RegisterResponse> {
  const res = await fetch(`${getApiBase()}/api/auth/register`, {
    ...baseFetchOptions,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  const data = await parseJsonOrThrow<
    RegisterResponse & { message?: string; fieldErrors?: { message?: string }[] }
  >(res);
  if (!res.ok) {
    throw new Error(data?.message ?? data?.fieldErrors?.[0]?.message ?? '회원가입에 실패했습니다.');
  }
  return data;
}

/** 현재 로그인 사용자 조회 (JWT 필요) */
export async function getMe(): Promise<LoginResponse | null> {
  const res = await fetch(`${getApiBase()}/api/auth/me`, {
    ...baseFetchOptions,
    method: 'GET',
    headers: authHeaders(),
  });
  if (res.status === 401) return null;
  if (!res.ok) return null;
  try {
    return await parseJsonOrThrow<LoginResponse>(res);
  } catch {
    return null;
  }
}

/** 로그아웃 */
export async function logout(): Promise<void> {
  await fetch(`${getApiBase()}/api/auth/logout`, {
    ...baseFetchOptions,
    method: 'POST',
    headers: authHeaders(),
  });
}

/** 저장된 로그인 ID 조회 (localStorage) */
export function getSavedLoginId(): string | null {
  const v = storage.get<string | null>(STORAGE_KEYS.REMEMBER_LOGIN_ID, null);
  return typeof v === 'string' && v ? v : null;
}

/** 로그인 ID 저장 (아이디만, 비밀번호 저장 금지) */
export function saveLoginIdCookie(loginId: string): void {
  storage.set(STORAGE_KEYS.REMEMBER_LOGIN_ID, loginId);
}

/** 저장된 로그인 ID 삭제 */
export function clearLoginIdCookie(): void {
  storage.remove(STORAGE_KEYS.REMEMBER_LOGIN_ID);
}
