'use client';

import { useState, useEffect } from 'react';
import {
  fetchMyCompany,
  createMyCompany,
  updateMyCompany,
  type CompanyItem,
  type CompanyCreateRequest,
} from '@/services';
import { getMe } from '@/services/auth.service';
import { useAuthStore } from '@/stores';
import { formatBusinessNumber, formatPhoneNumber } from '@/utils/inputFormat';
import '../../../styles/Settings.css';

function copyToClipboard(text: string) {
  return navigator.clipboard.writeText(text);
}

export default function CompanyInfo() {
  const { setUser } = useAuthStore();
  const [company, setCompany] = useState<CompanyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let nextValue = value;
    if (name === 'businessNumber') {
      nextValue = formatBusinessNumber(value);
    } else if (name === 'phone') {
      nextValue = formatPhoneNumber(value);
    }
    setForm((prev) => ({ ...prev, [name]: nextValue }));
  };

  const handleLicenseFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setBusinessLicenseFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('회사명은 필수입니다.');
      return;
    }
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        businessNumber: form.businessNumber.trim() || undefined,
        address: form.address.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        ceoName: form.ceoName.trim() || undefined,
      };

      const savedCompany = company
        ? await updateMyCompany(payload, businessLicenseFile)
        : await createMyCompany(payload, businessLicenseFile);

      setCompany(savedCompany);
      setForm({
        name: savedCompany.name,
        businessNumber: savedCompany.businessNumber ?? '',
        address: savedCompany.address ?? '',
        phone: savedCompany.phone ?? '',
        email: savedCompany.email ?? '',
        ceoName: savedCompany.ceoName ?? '',
      });
      setBusinessLicenseFile(null);
      setSuccess(company ? '회사 정보가 수정되었습니다.' : '회사 정보가 등록되었습니다.');

      if (!company) {
        const me = await getMe();
        if (me) setUser(me);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '회사 정보 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyAddress = () => {
    if (form.address?.trim()) {
      copyToClipboard(form.address.trim());
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

  const hasCompany = !!company;
  return (
    <div className="settings-page">
      <h1>회사 / 셀러 정보</h1>
      <p className="page-desc">셀러 및 회사 기본 정보를 등록·수정합니다.</p>

      {!hasCompany && (
        <p className="company-info-help">
          서비스 이용을 위해 회사 정보를 먼저 등록해 주세요. 등록 후에도 이 화면에서 언제든 수정 가능합니다.
        </p>
      )}

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {success && (
        <div className="form-success" role="status">
          {success}
        </div>
      )}

      <section className="settings-section">
        <h2>{hasCompany ? '회사 정보 수정' : '회사 정보 등록'}</h2>
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
            <div className="company-info-address-wrap">
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
                className="company-info-address"
                placeholder="주소"
              />
              <button
                type="button"
                className="btn btn-outline company-info-copy-btn"
                onClick={handleCopyAddress}
                disabled={!form.address?.trim()}
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
            <label>사업자등록증</label>
            <div>
              <input
                type="file"
                name="businessLicenseFile"
                accept=".pdf,image/png,image/jpeg"
                onChange={handleLicenseFileChange}
              />
              <p className="form-hint">PDF, JPG, PNG 파일(최대 10MB) 업로드 가능</p>
              {businessLicenseFile && (
                <p className="company-info-license-name">선택 파일: {businessLicenseFile.name}</p>
              )}
              {!businessLicenseFile && company?.businessLicenseFileName && (
                <p className="company-info-license-name">
                  저장된 파일: {company.businessLicenseFileName}
                </p>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving
                ? hasCompany
                  ? '수정 중...'
                  : '등록 중...'
                : hasCompany
                  ? '회사 정보 수정'
                  : '회사 정보 등록'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
