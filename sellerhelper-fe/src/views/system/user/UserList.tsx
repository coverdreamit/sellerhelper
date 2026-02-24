'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/Link';
import {
  fetchUserList,
  fetchPendingUsers,
  updateUser,
  deleteUser,
  createDemoUsers,
  resetUsersExceptAdmin,
  type UserListItem,
} from '@/services/user.service';
import '../../../styles/Settings.css';

function formatLastLogin(iso: string | null): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

function formatCreatedAt(iso: string | null | undefined): string {
  if (!iso) return '-';
  try {
    return new Date(iso).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}

export default function UserList() {
  const [pendingList, setPendingList] = useState<UserListItem[]>([]);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [keyword, setKeyword] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchRoleCode, setSearchRoleCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [utilLoading, setUtilLoading] = useState(false);
  const [utilOpen, setUtilOpen] = useState(false);
  const isDev = process.env.NODE_ENV === 'development';

  const reloadList = async () => {
    const fetchRes = await fetchUserList({
      keyword: searchKeyword || undefined,
      roleCode: searchRoleCode || undefined,
      enabled: true,
      page: 0,
      size,
      sortBy: 'uid',
      sortDir: 'DESC',
    });
    setUsers(fetchRes.content);
    setTotalElements(fetchRes.totalElements);
    setPage(0);
  };

  const loadPendingList = async () => {
    try {
      const res = await fetchPendingUsers();
      setPendingList(res.content);
    } catch {
      setPendingList([]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchUserList({
      keyword: searchKeyword || undefined,
      roleCode: searchRoleCode || undefined,
      enabled: true,
      page,
      size,
      sortBy: 'uid',
      sortDir: 'DESC',
    })
      .then((res) => {
        if (!cancelled) {
          setUsers(res.content);
          setTotalElements(res.totalElements);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : '목록 조회 실패');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [page, searchKeyword, searchRoleCode]);

  useEffect(() => {
    loadPendingList();
  }, []);

  const handleCreateDemo = async () => {
    setUtilOpen(false);
    setUtilLoading(true);
    setError(null);
    try {
      const res = await createDemoUsers();
      if (res.created > 0) {
        await reloadList();
        await loadPendingList();
      }
      alert(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : '데모 사용자 생성 실패');
    } finally {
      setUtilLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('admin 계정을 제외한 모든 사용자를 삭제합니다. 계속하시겠습니까?')) return;
    setUtilOpen(false);
    setUtilLoading(true);
    setError(null);
    try {
      const res = await resetUsersExceptAdmin();
      await reloadList();
      await loadPendingList();
      alert(res.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : '사용자 초기화 실패');
    } finally {
      setUtilLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchKeyword(keyword);
    setSearchRoleCode(roleCode);
    setPage(0);
  };

  const handleApprove = async (u: UserListItem) => {
    try {
      await updateUser(u.uid, { enabled: true });
      setPendingList((prev) => prev.filter((p) => p.uid !== u.uid));
      await reloadList();
      alert(`${u.name} 님의 승인이 완료되었습니다.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '승인 처리 실패');
    }
  };

  const handleReject = async (u: UserListItem) => {
    if (!confirm(`${u.name} 님의 가입을 거절하시겠습니까?`)) return;
    try {
      await deleteUser(u.uid);
      setPendingList((prev) => prev.filter((p) => p.uid !== u.uid));
      alert('거절 처리되었습니다.');
    } catch (err) {
      setError(err instanceof Error ? err.message : '거절 처리 실패');
    }
  };

  return (
    <div className="settings-page">
      <h1>사용자 목록</h1>
      <p className="page-desc">시스템 사용자 계정을 조회·관리합니다.</p>

      {/* 회원 가입 승인 대기 */}
      {pendingList.length > 0 && (
        <section className="settings-section" style={{ marginBottom: 24 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            회원 가입 승인 대기
            <span className="badge badge-warning">{pendingList.length}건</span>
          </h2>
          <p className="page-desc" style={{ margin: '0 0 16px 0', fontSize: '0.85rem' }}>
            회원가입을 신청한 사용자의 승인 또는 거절을 처리합니다.
          </p>
          <div className="settings-table-wrap">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>로그인 ID</th>
                  <th>이메일</th>
                  <th>권한</th>
                  <th>신청일시</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((u) => (
                  <tr key={u.uid}>
                    <td>{u.name}</td>
                    <td>{u.loginId}</td>
                    <td>{u.email ?? '-'}</td>
                    <td>{u.roleNames ?? '-'}</td>
                    <td>{formatCreatedAt(u.createdAt)}</td>
                    <td className="cell-actions">
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => handleApprove(u)}
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(u)}
                        >
                          거절
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <input
              type="text"
              placeholder="이름/아이디 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <select
              value={roleCode}
              onChange={(e) => setRoleCode(e.target.value)}
              style={{ padding: '6px 12px', marginRight: 8 }}
            >
              <option value="">전체 권한</option>
              <option value="ADMIN">관리자</option>
              <option value="SELLER">셀러</option>
              <option value="ORDER">주문담당</option>
            </select>
            <button type="button" className="btn" onClick={handleSearch}>
              검색
            </button>
          </div>
          {isDev && (
            <div style={{ position: 'relative', marginRight: 8 }}>
              <button
                type="button"
                className="btn"
                onClick={() => setUtilOpen(!utilOpen)}
                disabled={utilLoading}
                title="관리자 유틸 (개발모드)"
              >
                관리자 유틸 ▼
              </button>
              {utilOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 10 }}
                    onClick={() => setUtilOpen(false)}
                    aria-hidden
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: 4,
                      background: '#fff',
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      minWidth: 180,
                      zIndex: 20,
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 16px',
                        textAlign: 'left',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                      onClick={handleCreateDemo}
                    >
                      데모 사용자 생성
                    </button>
                    <button
                      type="button"
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '10px 16px',
                        textAlign: 'left',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        color: '#dc2626',
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = '#fef2f2')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                      onClick={handleReset}
                    >
                      admin 제외 사용자 초기화
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
          <Link to="/system/user/role" className="btn">
            권한 관리
          </Link>
          <Link to="/system/user/register" className="btn btn-primary">
            사용자 등록
          </Link>
        </div>
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
        <div className="settings-table-wrap">
          {loading ? (
            <p style={{ padding: 24, textAlign: 'center', color: '#64748b' }}>
              목록을 불러오는 중...
            </p>
          ) : (
            <table className="settings-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>로그인 ID</th>
                  <th>이메일</th>
                  <th>권한</th>
                  <th>상태</th>
                  <th>최근 로그인</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                      등록된 사용자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.uid}>
                      <td>{u.name}</td>
                      <td>{u.loginId}</td>
                      <td>{u.email ?? '-'}</td>
                      <td>{u.roleNames ?? '-'}</td>
                      <td>
                        <span className={`badge badge-${u.enabled ? 'active' : 'inactive'}`}>
                          {u.enabled ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td>{formatLastLogin(u.lastLoginAt)}</td>
                      <td className="cell-actions">
                        <Link to={`/system/user/${u.uid}/edit`}>수정</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {totalElements > 0 && (
          <div
            style={{
              marginTop: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>총 {totalElements}건</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-sm"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                이전
              </button>
              <span style={{ padding: '6px 12px', fontSize: '0.875rem' }}>
                {page + 1} / {Math.max(1, Math.ceil(totalElements / size))}
              </span>
              <button
                type="button"
                className="btn btn-sm"
                disabled={page >= Math.ceil(totalElements / size) - 1}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
