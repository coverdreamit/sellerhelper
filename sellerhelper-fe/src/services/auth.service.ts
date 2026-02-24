/**
 * 인증 서비스 - 세션 기반 로그인/회원가입
 * credentials: 'include' 로 세션 쿠키 전달
 */

const COOKIE_LOGIN_ID = 'sellerhelper_remember_loginId';
const COOKIE_PASSWORD = 'sellerhelper_remember_password';
const COOKIE_DAYS = 30;

const apiFetchOptions: RequestInit = {
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
};

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
  const data = await res.json();
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
  const data = await res.json();
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
  return res.json();
}

/** 로그아웃 */
export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', {
    ...apiFetchOptions,
    method: 'POST',
  });
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string, days: number): void {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/** 저장된 로그인 ID 조회 (쿠키) */
export function getSavedLoginId(): string | null {
  return getCookie(COOKIE_LOGIN_ID);
}

/** 저장된 비밀번호 조회 (쿠키, 개발용) */
export function getSavedPassword(): string | null {
  return getCookie(COOKIE_PASSWORD);
}

/** 아이디·비밀번호 쿠키 저장 (개발용) */
export function saveRememberCookies(loginId: string, password: string): void {
  setCookie(COOKIE_LOGIN_ID, loginId, COOKIE_DAYS);
  setCookie(COOKIE_PASSWORD, password, COOKIE_DAYS);
}

/** 로그인 ID 쿠키 저장 */
export function saveLoginIdCookie(loginId: string): void {
  setCookie(COOKIE_LOGIN_ID, loginId, COOKIE_DAYS);
}

/** 아이디·비밀번호 쿠키 삭제 */
export function clearLoginIdCookie(): void {
  clearCookie(COOKIE_LOGIN_ID);
  clearCookie(COOKIE_PASSWORD);
}
