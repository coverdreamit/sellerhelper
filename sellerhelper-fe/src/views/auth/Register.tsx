'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  register as registerApi,
  searchCompanies,
  type CompanySearchItem,
} from '@/services/auth.service';
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

function formatPhoneNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

function formatBusinessNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
}

export default function Register() {
  const router = useRouter();
  const [registerCompanyMode, setRegisterCompanyMode] = useState<'EXISTING' | 'NEW'>('EXISTING');
  const [form, setForm] = useState({
    name: '',
    loginId: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    companyKeyword: '',
    existingCompanyUid: '',
    newCompanyName: '',
    newBusinessNumber: '',
  });
  const [companyOptions, setCompanyOptions] = useState<CompanySearchItem[]>([]);
  const [companySearchLoading, setCompanySearchLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (registerCompanyMode !== 'EXISTING') {
      setCompanyOptions([]);
      return;
    }
    const keyword = form.companyKeyword.trim();
    if (keyword.length < 2) {
      setCompanyOptions([]);
      return;
    }
    let cancelled = false;
    setCompanySearchLoading(true);
    const timer = setTimeout(() => {
      searchCompanies(keyword, 10)
        .then((items) => {
          if (!cancelled) setCompanyOptions(items);
        })
        .catch(() => {
          if (!cancelled) setCompanyOptions([]);
        })
        .finally(() => {
          if (!cancelled) setCompanySearchLoading(false);
        });
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [registerCompanyMode, form.companyKeyword]);

  const fillRandomData = () => {
    const loginId = `user${randomStr(6)}`;
    const basePw = 'Test1234!';
    setRegisterCompanyMode('NEW');
    setForm({
      name: KOREAN_NAMES[Math.floor(Math.random() * KOREAN_NAMES.length)]!,
      loginId,
      email: `${loginId}@example.com`,
      password: basePw,
      passwordConfirm: basePw,
      phone: randomPhone(),
      companyKeyword: '',
      existingCompanyUid: '',
      newCompanyName: COMPANY_NAMES[Math.floor(Math.random() * COMPANY_NAMES.length)]!,
      newBusinessNumber: '',
    });
    setAgreeTerms(true);
    setAgreePrivacy(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      setForm((prev) => ({ ...prev, phone: formatPhoneNumber(value) }));
      return;
    }
    if (name === 'newBusinessNumber') {
      setForm((prev) => ({ ...prev, newBusinessNumber: formatBusinessNumber(value) }));
      return;
    }
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
    if (registerCompanyMode === 'EXISTING' && !form.existingCompanyUid) {
      setError('기존 회사 가입을 선택한 경우 회사를 선택해 주세요.');
      return;
    }
    if (registerCompanyMode === 'NEW' && !form.newCompanyName.trim()) {
      setError('신규 회사 등록 시 회사명을 입력해 주세요.');
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
        registerCompanyMode,
        existingCompanyUid: form.existingCompanyUid ? Number(form.existingCompanyUid) : undefined,
        newCompanyName: form.newCompanyName.trim() || undefined,
        newBusinessNumber: form.newBusinessNumber.trim() || undefined,
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
                maxLength={13}
              />
            </div>

            <div className="login-field">
              <label className="login-label">회사 가입 방식</label>
              <div className="register-agreements">
                <label className="login-check">
                  <input
                    type="radio"
                    name="register-company-mode"
                    checked={registerCompanyMode === 'EXISTING'}
                    onChange={() => {
                      setRegisterCompanyMode('EXISTING');
                      setForm((prev) => ({
                        ...prev,
                        newCompanyName: '',
                        newBusinessNumber: '',
                      }));
                    }}
                  />
                  <span>기존 회사에 가입</span>
                </label>
                <label className="login-check">
                  <input
                    type="radio"
                    name="register-company-mode"
                    checked={registerCompanyMode === 'NEW'}
                    onChange={() => {
                      setRegisterCompanyMode('NEW');
                      setForm((prev) => ({
                        ...prev,
                        companyKeyword: '',
                        existingCompanyUid: '',
                      }));
                      setCompanyOptions([]);
                    }}
                  />
                  <span>신규 회사 등록</span>
                </label>
              </div>
            </div>

            {registerCompanyMode === 'EXISTING' ? (
              <>
                <div className="login-field">
                  <label htmlFor="reg-companyKeyword" className="login-label">
                    회사 검색 <span className="required">*</span>
                  </label>
                  <input
                    id="reg-companyKeyword"
                    name="companyKeyword"
                    type="text"
                    className="login-input"
                    placeholder="회사명 2글자 이상 입력"
                    value={form.companyKeyword}
                    onChange={handleChange}
                  />
                </div>
                <div className="login-field">
                  <label htmlFor="reg-existingCompanyUid" className="login-label">
                    검색 결과 선택 <span className="required">*</span>
                  </label>
                  <select
                    id="reg-existingCompanyUid"
                    name="existingCompanyUid"
                    className="login-input"
                    value={form.existingCompanyUid}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, existingCompanyUid: e.target.value }))
                    }
                    required
                  >
                    <option value="">회사를 선택하세요</option>
                    {companyOptions.map((c) => (
                      <option key={c.uid} value={String(c.uid)}>
                        {c.name}
                        {c.businessNumber ? ` (${c.businessNumber})` : ''}
                      </option>
                    ))}
                  </select>
                  {companySearchLoading && (
                    <div className="login-subtitle" style={{ fontSize: 12, marginTop: 6 }}>
                      회사 검색 중...
                    </div>
                  )}
                  {!companySearchLoading && form.companyKeyword.trim().length >= 2 && companyOptions.length === 0 && (
                    <div className="login-subtitle" style={{ fontSize: 12, marginTop: 6 }}>
                      검색 결과가 없습니다.{' '}
                      <button
                        type="button"
                        className="login-link login-link--btn"
                        onClick={() => {
                          setRegisterCompanyMode('NEW');
                          setForm((prev) => ({
                            ...prev,
                            newCompanyName: prev.companyKeyword.trim(),
                            companyKeyword: '',
                            existingCompanyUid: '',
                          }));
                        }}
                      >
                        신규 회사 등록으로 전환
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="login-field">
                  <label htmlFor="reg-newCompanyName" className="login-label">
                    신규 회사명 <span className="required">*</span>
                  </label>
                  <input
                    id="reg-newCompanyName"
                    name="newCompanyName"
                    type="text"
                    className="login-input"
                    placeholder="회사 또는 사업자명"
                    value={form.newCompanyName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="login-field">
                  <label htmlFor="reg-newBusinessNumber" className="login-label">
                    사업자등록번호
                  </label>
                  <input
                    id="reg-newBusinessNumber"
                    name="newBusinessNumber"
                    type="text"
                    className="login-input"
                    placeholder="000-00-00000"
                    value={form.newBusinessNumber}
                    onChange={handleChange}
                    maxLength={12}
                  />
                </div>
              </>
            )}

            <div className="login-field">
              <div className="register-agreements">
                <label className="login-check">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                  />
                  <span>
                    <span className="login-link">이용약관</span>{' '}
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
                    <span className="login-link">개인정보처리방침</span>{' '}
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
