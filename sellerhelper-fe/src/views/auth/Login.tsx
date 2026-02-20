'use client';

import { useState } from 'react';
import Link from 'next/link';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 연동 시 API 호출
    console.log({ email, password, remember });
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
            <div className="login-field">
              <label htmlFor="login-email" className="login-label">
                이메일
              </label>
              <input
                id="login-email"
                type="email"
                className="login-input"
                placeholder="example@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
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
                <span>아이디 저장</span>
              </label>
              <Link href="/login/forgot" className="login-link">
                비밀번호 찾기
              </Link>
            </div>

            <button type="submit" className="login-btn">
              로그인
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
