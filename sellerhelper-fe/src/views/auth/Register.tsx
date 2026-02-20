'use client';

import { useState } from 'react';
import Link from 'next/link';
import './Login.css';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    loginId: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    companyName: '',
  });
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      alert('약관에 동의해 주세요.');
      return;
    }
    // TODO: 연동 시 API 호출
    console.log({ ...form, agreeTerms, agreePrivacy });
  };

  return (
    <div className="login-page">
      <div className="login-backdrop">
        <div className="login-shape login-shape--1" />
        <div className="login-shape login-shape--2" />
        <div className="login-shape login-shape--3" />
        <div className="login-grid" aria-hidden />
      </div>

      <div className="login-container" style={{ maxWidth: 460 }}>
        <div className="login-card">
          <div className="login-brand">
            <div className="login-logo">S</div>
            <h1 className="login-title">회원가입</h1>
            <p className="login-subtitle">
              셀러헬퍼 서비스 이용을 위해<br />
              회원 정보를 입력해 주세요.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-field">
              <label htmlFor="reg-name" className="login-label">
                이름 <span className="required">*</span>
              </label>
              <input
                id="reg-name"
                name="name"
                type="text"
                className="login-input"
                placeholder="실명을 입력하세요"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="reg-loginId" className="login-label">
                로그인 ID <span className="required">*</span>
              </label>
              <input
                id="reg-loginId"
                name="loginId"
                type="text"
                className="login-input"
                placeholder="영문, 숫자 4자 이상"
                value={form.loginId}
                onChange={handleChange}
                autoComplete="username"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="reg-email" className="login-label">
                이메일 <span className="required">*</span>
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                className="login-input"
                placeholder="example@example.com"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="reg-password" className="login-label">
                비밀번호 <span className="required">*</span>
              </label>
              <input
                id="reg-password"
                name="password"
                type="password"
                className="login-input"
                placeholder="8자 이상, 영문·숫자 조합"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="reg-passwordConfirm" className="login-label">
                비밀번호 확인 <span className="required">*</span>
              </label>
              <input
                id="reg-passwordConfirm"
                name="passwordConfirm"
                type="password"
                className="login-input"
                placeholder="비밀번호를 다시 입력하세요"
                value={form.passwordConfirm}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="reg-phone" className="login-label">
                연락처
              </label>
              <input
                id="reg-phone"
                name="phone"
                type="tel"
                className="login-input"
                placeholder="010-0000-0000"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="login-field">
              <label htmlFor="reg-company" className="login-label">
                회사명
              </label>
              <input
                id="reg-company"
                name="companyName"
                type="text"
                className="login-input"
                placeholder="회사 또는 사업자명"
                value={form.companyName}
                onChange={handleChange}
              />
            </div>

            <div className="login-field">
              <div className="register-agreements">
                <label className="login-check">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span>
                    <a href="#terms" className="login-link">
                      이용약관
                    </a>{' '}
                    동의 (필수)
                  </span>
                </label>
                <label className="login-check">
                  <input
                    type="checkbox"
                    checked={agreePrivacy}
                    onChange={(e) => setAgreePrivacy(e.target.checked)}
                  />
                  <span>
                    <a href="#privacy" className="login-link">
                      개인정보처리방침
                    </a>{' '}
                    동의 (필수)
                  </span>
                </label>
              </div>
            </div>

            <button type="submit" className="login-btn">
              회원가입
            </button>

            <p className="login-footer">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="login-link">
                로그인
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
