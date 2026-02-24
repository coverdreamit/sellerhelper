'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register as registerApi } from '@/services/auth.service';
import './Login.css';

const KOREAN_NAMES = ['김철수', '이영희', '박민수', '최지현', '정수진', '한동훈', '윤서연', '임준혁', '강미영', '조성민'];
const COMPANY_NAMES = ['(주)테스트회사', '개인사업자', '스마트스토어', '셀러헬퍼샵', '테스트몰'];

function randomStr(len: number, chars = 'abcdefghijklmnopqrstuvwxyz0123456789') {
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

function randomPhone() {
  return `010-${String(Math.floor(1000 + Math.random() * 9000))}-${String(Math.floor(1000 + Math.random() * 9000))}`;
}

export default function Register() {
  const router = useRouter();
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fillRandomData = () => {
    const loginId = `user${randomStr(6)}`;
    const basePw = 'Test1234!';
    setForm({
      name: KOREAN_NAMES[Math.floor(Math.random() * KOREAN_NAMES.length)]!,
      loginId,
      email: `${loginId}@example.com`,
      password: basePw,
      passwordConfirm: basePw,
      phone: randomPhone(),
      companyName: COMPANY_NAMES[Math.floor(Math.random() * COMPANY_NAMES.length)]!,
    });
    setAgreeTerms(true);
    setAgreePrivacy(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!agreeTerms || !agreePrivacy) {
      setError('약관에 동의해 주세요.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await registerApi({
        name: form.name,
        loginId: form.loginId,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        companyName: form.companyName || undefined,
      });
      alert('회원가입이 완료되었습니다. 관리자 승인 후 이용 가능합니다. 승인 여부 검토 중입니다.');
      router.replace('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page login-page--register">
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
            <h1 className="login-title">회원가입</h1>
            <p className="login-subtitle">
              셀러헬퍼 서비스 이용을 위해<br />
              회원 정보를 입력해 주세요.
            </p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="login-error" role="alert">
                {error}
              </div>
            )}
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

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? '가입 중...' : '회원가입'}
            </button>

            <p className="login-footer">
              이미 계정이 있으신가요?{' '}
              <Link href="/login" className="login-link">
                로그인
              </Link>
              {' | '}
              <button
                type="button"
                className="login-link login-link--btn"
                onClick={fillRandomData}
                aria-label="개발용 랜덤 데이터 채우기"
              >
                랜덤 데이터 생성
              </button>
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
