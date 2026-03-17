'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMyCompany, createMyCompany, type CompanyItem, type CompanyCreateRequest } from '@/services';
import { useAuthStore } from '@/stores';
import '../../../styles/Settings.css';

function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text);
}

export default function CompanyInfo() {
  const router = useRouter();
  const { logout: logoutStore } = useAuthStore();
  const [company, setCompany] = useState<CompanyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [businessDocument, setBusinessDocument] = useState<File | null>(null);
  const [form, setForm] = useState<CompanyCreateRequest>({
    name: '',
    businessNumber: '',
    address: '',
    phone: '',
    email: '',
    ceoName: '',
  });

  useEffect(() => {
    fetchMyCompany()
      .then((c) => {
        setCompany(c ?? null);
        if (c) {
          setForm({
            name: c.name,
            businessNumber: c.businessNumber ?? '',
            address: c.address ?? '',
            phone: c.phone ?? '',
            email: c.email ?? '',
            ceoName: c.ceoName ?? '',
          });
        }
      })
      .catch(() => setCompany(null))
      .finally(() => setLoading(false));
  }, []);

  const needsRegistration = !company || !company.businessDocumentUploaded;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('회사명은 필수입니다.');
      return;
    }
    if (!businessDocument) {
      setError('사업자등록증명서 파일을 업로드해 주세요.');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await createMyCompany({
        name: form.name.trim(),
        businessNumber: form.businessNumber.trim() || undefined,
        address: form.address.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        ceoName: form.ceoName.trim() || undefined,
      }, businessDocument);
      logoutStore();
      alert('사업자등록이 완료되었습니다. 관리자 승인 후 로그인하여 이용할 수 있습니다.');
      router.replace('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : '회사 등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyAddress = () => {
    if (company?.address) {
      copyToClipboard(company.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <h1>회사 / 셀러 정보</h1>
        <p className="page-desc">로딩 중...</p>
      </div>
    );
  }

  // 회사/문서 미등록: 등록(또는 보완 등록) 폼 표시
  if (needsRegistration) {
    return (
      <div className="settings-page">
        <h1>회사 / 셀러 정보</h1>
        <p className="page-desc">
          서비스 이용을 위해 회사 정보와 사업자등록증명서를 등록해 주세요. 등록 전에는 다른 메뉴를 이용할 수 없습니다.
        </p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <section className="settings-section">
          <h2>회사 정보 등록</h2>
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="required">회사명</label>
              <div>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="회사 또는 사업자명"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <label>사업자등록번호</label>
              <div>
                <input
                  type="text"
                  name="businessNumber"
                  value={form.businessNumber}
                  onChange={handleChange}
                  placeholder="000-00-00000"
                />
              </div>
            </div>
            <div className="form-row">
              <label>대표자명</label>
              <div>
                <input
                  type="text"
                  name="ceoName"
                  value={form.ceoName}
                  onChange={handleChange}
                  placeholder="대표자명"
                />
              </div>
            </div>
            <div className="form-row">
              <label>주소</label>
              <div>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="주소"
                />
              </div>
            </div>
            <div className="form-row">
              <label>연락처</label>
              <div>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="010-0000-0000"
                />
              </div>
            </div>
            <div className="form-row">
              <label>이메일</label>
              <div>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="example@example.com"
                />
              </div>
            </div>
            <div className="form-row">
              <label className="required">사업자등록증명서</label>
              <div>
                <input
                  type="file"
                  accept=".pdf,image/png,image/jpeg"
                  onChange={(e) => setBusinessDocument(e.target.files?.[0] ?? null)}
                  required
                />
                <p className="form-hint">PDF, JPG, PNG 파일만 업로드할 수 있습니다.</p>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '등록 중...' : '회사 정보/증빙 등록'}
              </button>
            </div>
          </form>
        </section>
      </div>
    );
  }

  // 회사 등록됨: 조회 전용 (추후 수정 기능 추가 가능)
  return (
    <div className="settings-page">
      <h1>회사 / 셀러 정보</h1>
      <p className="page-desc">셀러 및 회사 기본 정보를 등록·수정합니다.</p>

      <div className="company-info-approval-badge">
        <span className="badge badge-inactive">수정 불가</span>
        <span className="company-info-approval-text">관리자 승인 필요</span>
      </div>

      <section className="settings-section">
        <h2>기본 정보</h2>
        <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <label className="required">회사명</label>
            <div>
              <input
                type="text"
                value={company.name}
                readOnly
                disabled
                className="form-input-readonly"
              />
            </div>
          </div>
          <div className="form-row">
            <label>사업자등록번호</label>
            <div>
              <input
                type="text"
                value={company.businessNumber ?? ''}
                readOnly
                disabled
                className="form-input-readonly"
              />
            </div>
          </div>
          <div className="form-row">
            <label>대표자명</label>
            <div>
              <input
                type="text"
                value={company.ceoName ?? ''}
                readOnly
                disabled
                className="form-input-readonly"
              />
            </div>
          </div>
          <div className="form-row">
            <label>주소</label>
            <div className="company-info-address-wrap">
              <input
                type="text"
                value={company.address ?? ''}
                readOnly
                disabled
                className="form-input-readonly company-info-address"
              />
              <button
                type="button"
                className="btn btn-outline company-info-copy-btn"
                onClick={handleCopyAddress}
              >
                {copied ? '복사됨' : '복사하기'}
              </button>
            </div>
          </div>
          <div className="form-row">
            <label>연락처</label>
            <div>
              <input
                type="text"
                value={company.phone ?? ''}
                readOnly
                disabled
                className="form-input-readonly"
              />
            </div>
          </div>
          <div className="form-row">
            <label>이메일</label>
            <div>
              <input
                type="email"
                value={company.email ?? ''}
                readOnly
                disabled
                className="form-input-readonly"
              />
            </div>
          </div>
          <div className="form-row">
            <label>사업자등록증명서</label>
            <div style={{ padding: '8px 0', color: '#475569' }}>
              {company.businessDocumentName ?? '업로드된 문서 없음'}
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
