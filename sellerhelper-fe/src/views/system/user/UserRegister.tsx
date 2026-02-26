'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/Link';
import { fetchRoles, createUser, type RoleItem } from '@/services/user.service';
import '../../../styles/Settings.css';

export default function UserRegister() {
  const router = useRouter();
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [form, setForm] = useState({
    name: '',
    loginId: '',
    password: '',
    passwordConfirm: '',
    email: '',
    phone: '',
    roleUid: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoles()
      .then(setRoles)
      .catch(() => setRoles([]))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (!form.roleUid) {
      setError('권한을 선택해 주세요.');
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await createUser({
        loginId: form.loginId.trim(),
        password: form.password,
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        enabled: true,
        roleUids: [Number(form.roleUid)],
      });
      alert('사용자가 등록되었습니다.');
      router.replace('/system/user');
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 등록에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <p style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h1>사용자 등록</h1>
      <p className="page-desc">새 사용자 계정을 등록합니다.</p>

      {error && (
        <div className="form-error" role="alert" style={{ marginBottom: 16 }}>
          {error}
        </div>
      )}

      <section className="settings-section">
        <h2>계정 정보</h2>
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="required">이름</label>
            <div>
              <input
                type="text"
                name="name"
                placeholder="사용자 이름"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <label className="required">로그인 ID</label>
            <div>
              <input
                type="text"
                name="loginId"
                placeholder="로그인에 사용할 ID"
                value={form.loginId}
                onChange={handleChange}
                required
              />
              <p className="form-hint">영문, 숫자 조합 4자 이상</p>
            </div>
          </div>
          <div className="form-row">
            <label className="required">비밀번호</label>
            <div>
              <input
                type="password"
                name="password"
                placeholder="비밀번호"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <label className="required">비밀번호 확인</label>
            <div>
              <input
                type="password"
                name="passwordConfirm"
                placeholder="비밀번호 재입력"
                value={form.passwordConfirm}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <label className="required">이메일</label>
            <div>
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <label>연락처</label>
            <div>
              <input
                type="text"
                name="phone"
                placeholder="010-0000-0000"
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row">
            <label className="required">권한</label>
            <div>
              <select name="roleUid" value={form.roleUid} onChange={handleChange} required>
                <option value="">선택</option>
                {roles.map((r) => (
                  <option key={r.uid} value={r.uid}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="settings-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '등록 중...' : '등록'}
            </button>
            <Link to="/system/user" className="btn">
              취소
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
