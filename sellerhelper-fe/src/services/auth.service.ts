/**
 * 인증 서비스 - 세션 기반 로그인/회원가입
 * credentials: 'include' 로 세션 쿠키 전달
 * 비밀번호 저장 금지 → 아이디만 localStorage 저장
 */

import { storage } from '@/shared/storage/storage';
import { STORAGE_KEYS } from '@/shared/storage/keys';

const apiFetchOptions: RequestInit = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

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
  uid: number;
  loginId: string;
  name: string;
  roleCodes: string[];
  /** 사용자 권한들의 메뉴 접근 키 합집합 */
  menuKeys?: string[];
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
  const res = await fetch('/api/auth/login', {
    ...apiFetchOptions,
    method: 'POST',
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
  const res = await fetch('/api/auth/register', {
    ...apiFetchOptions,
    method: 'POST',
    body: JSON.stringify(req),
  });
  const data = await parseJsonOrThrow<RegisterResponse & { message?: string; fieldErrors?: { message?: string }[] }>(res);
  if (!res.ok) {
    throw new Error(data?.message ?? data?.fieldErrors?.[0]?.message ?? '회원가입에 실패했습니다.');
  }
  return data;
}

/** 현재 세션 사용자 조회 (로그인 여부 확인) */
export async function getMe(): Promise<LoginResponse | null> {
  const res = await fetch('/api/auth/me', {
    ...apiFetchOptions,
    method: 'GET',
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
  await fetch('/api/auth/logout', {
    ...apiFetchOptions,
    method: 'POST',
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
