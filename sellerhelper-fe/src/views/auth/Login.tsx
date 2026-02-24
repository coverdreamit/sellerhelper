'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  login,
  getSavedLoginId,
  getSavedPassword,
  saveRememberCookies,
  clearLoginIdCookie,
} from '@/services/auth.service';
import { useAuthStore } from '@/stores';
import './Login.css';

export default function Login() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedId = getSavedLoginId();
    const savedPw = getSavedPassword();
    if (savedId) {
      setLoginId(savedId);
      setRemember(true);
    }
    if (savedPw) {
      setPassword(savedPw);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      const res = await login({ loginId, password, rememberMe: remember });
      if (remember) {
        saveRememberCookies(loginId, password);
      } else {
        clearLoginIdCookie();
      }
      setUser(res);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-backdrop">
        <div className="login-shape login-shape--1" />
        <div className="login-shape login-shape--2" />
        <div className="login-shape login-shape--3" />
        <div className="login-grid" aria-hidden />
      </div>

      <div className="login-container">
        <div className="login-card">
          <div className="login-brand">
            <div className="login-logo">S</div>
            <h1 className="login-title">셀러헬퍼</h1>
            <p className="login-subtitle">
              스마트스토어·쿠팡·11번가 등 판매 현황을 한눈에,<br />
              주문·배송·정산을 효율적으로 관리하세요.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}
            <div className="login-field">
              <label htmlFor="login-id" className="login-label">
                아이디
              </label>
              <input
                id="login-id"
                type="text"
                className="login-input"
                placeholder="아이디를 입력하세요"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password" className="login-label">
                비밀번호
              </label>
              <input
                id="login-password"
                type="password"
                className="login-input"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <div className="login-options">
              <label className="login-check">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>아이디·비밀번호 저장</span>
              </label>
              <Link href="/login/forgot" className="login-link">
                비밀번호 찾기
              </Link>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? '로그인 중...' : '로그인'}
            </button>

            <p className="login-footer">
              계정이 없으신가요?{' '}
              <Link href="/login/register" className="login-link">
                회원가입
              </Link>
            </p>
          </form>
        </div>

        <p className="login-copyright">
          © 셀러헬퍼. 판매자 업무 효율화를 위한 통합 관리 시스템.
        </p>
      </div>
    </div>
  );
}
