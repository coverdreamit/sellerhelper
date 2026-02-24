'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from '@/components/Link';
import {
  fetchUser,
  fetchRoles,
  updateUser,
  type UserResponse,
  type RoleItem,
} from '@/services/user.service';
import '../../../styles/Settings.css';

export default function UserEdit({ uid }: { uid: number }) {
  const router = useRouter();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    enabled: true,
    password: '',
    roleUids: [] as number[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([fetchUser(uid), fetchRoles()])
      .then(([userRes, rolesRes]) => {
        if (cancelled) return;
        setUser(userRes);
        setRoles(rolesRes);
        // roleCodes -> roleUids 매핑
        const roleUids = rolesRes
          .filter((r) => (userRes.roleCodes ?? []).includes(r.code))
          .map((r) => r.uid);
        setForm({
          name: userRes.name ?? '',
          email: userRes.email ?? '',
          phone: userRes.phone ?? '',
          enabled: userRes.enabled ?? true,
          password: '',
          roleUids,
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '조회 실패');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleRoleToggle = (roleUid: number, checked: boolean) => {
    setForm((prev) => {
      const next = checked
        ? [...prev.roleUids, roleUid]
        : prev.roleUids.filter((u) => u !== roleUid);
      return { ...prev, roleUids: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateUser(uid, {
        name: form.name,
        email: form.email || undefined,
        phone: form.phone || undefined,
        enabled: form.enabled,
        password: form.password || undefined,
        roleUids: form.roleUids,
      });
      alert('저장되었습니다.');
      router.replace('/system/user');
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
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

  if (error && !user) {
    return (
      <div className="settings-page">
        <div style={{ padding: 24, color: '#dc2626' }}>{error}</div>
        <Link to="/system/user" className="btn">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h1>사용자 수정</h1>
      <p className="page-desc">
        사용자 정보와 권한을 수정합니다. 권한 변경 시 저장 버튼을 클릭하세요.
      </p>

      <section className="settings-section">
        <form className="settings-form" onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                padding: 12,
                marginBottom: 16,
                background: '#fef2f2',
                color: '#dc2626',
                borderRadius: 8,
              }}
            >
              {error}
            </div>
          )}
          <div className="form-row">
            <label>로그인 ID</label>
            <div style={{ padding: '8px 0', color: '#64748b' }}>{user?.loginId}</div>
          </div>
          <div className="form-row">
            <label className="required">이름</label>
            <div>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="사용자 이름"
                required
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
                placeholder="example@email.com"
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
            <label>상태</label>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  name="enabled"
                  checked={form.enabled}
                  onChange={handleChange}
                />
                활성
              </label>
            </div>
          </div>
          <div className="form-row">
            <label>비밀번호 변경</label>
            <div>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="변경 시에만 입력 (6자 이상)"
              />
              <p className="form-hint">비워두면 기존 비밀번호 유지</p>
            </div>
          </div>
          <div className="form-row">
            <label className="required">권한</label>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {roles.map((r) => (
                  <label key={r.uid} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={form.roleUids.includes(r.uid)}
                      onChange={(e) => handleRoleToggle(r.uid, e.target.checked)}
                    />
                    <span>
                      {r.name} ({r.code})
                    </span>
                  </label>
                ))}
              </div>
              <p className="form-hint" style={{ marginTop: 8 }}>
                사용자에게 부여할 권한을 선택하세요.
              </p>
            </div>
          </div>
          <div className="settings-actions" style={{ marginTop: 24 }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
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
