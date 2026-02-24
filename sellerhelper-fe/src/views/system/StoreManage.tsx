'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchSystemStores,
  deleteSystemStore,
  fetchMalls,
  fetchCompanies,
  type StoreItem,
  type MallItem,
  type CompanyItem,
} from '@/services';
import StoreRegisterModal from './store/StoreRegisterModal';
import StoreEditModal from './store/StoreEditModal';
import '@/styles/Settings.css';

/** 운영자용: 스토어 도메인 관리 (판매자 계정 단위) */
export default function StoreManage() {
  const [stores, setStores] = useState<StoreItem[]>([]);
  const [malls, setMalls] = useState<MallItem[]>([]);
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState<string>('');
  const [companyFilter, setCompanyFilter] = useState<string>('');
  const [showRegister, setShowRegister] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreItem | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [storeRes, mallRes, companyRes] = await Promise.all([
        fetchSystemStores({
          mallUid: platformFilter ? Number(platformFilter) : undefined,
          companyUid: companyFilter ? Number(companyFilter) : undefined,
        }),
        fetchMalls(),
        fetchCompanies(),
      ]);
      setStores(storeRes);
      setMalls(mallRes);
      setCompanies(companyRes);
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터 로회 실패');
    } finally {
      setLoading(false);
    }
  }, [platformFilter, companyFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredStores = stores.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.companyName?.toLowerCase().includes(q) ?? false) ||
      (s.mallSellerId?.toLowerCase().includes(q) ?? false)
    );
  });

  const handleDelete = async (store: StoreItem) => {
    if (!window.confirm(`"${store.name}" 스토어를 삭제하시겠습니까?`)) return;
    setDeleting(store.uid);
    setError('');
    try {
      await deleteSystemStore(store.uid);
      await loadData();
      setEditingStore(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '삭제 실패');
    } finally {
      setDeleting(null);
    }
  };

  if (loading && stores.length === 0) {
    return (
      <div className="settings-page">
        <h1>스토어 관리</h1>
        <p className="page-desc">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h1>스토어 관리</h1>
      <p className="page-desc">
        판매자가 실제로 운영하는 스토어(계정)를 관리합니다. 플랫폼은 코드 관리에서 등록하고, 여기서는 스토어 계정 단위로 등록·관리합니다.
      </p>

      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              style={{ padding: '6px 12px', marginRight: 8 }}
            >
              <option value="">전체 플랫폼</option>
              {malls.map((p) => (
                <option key={p.uid} value={String(p.uid)}>
                  {p.name}
                </option>
              ))}
            </select>
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              style={{ padding: '6px 12px', marginRight: 8 }}
            >
              <option value="">전체 회사</option>
              {companies.map((c) => (
                <option key={c.uid} value={String(c.uid)}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="스토어명/회사명 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
          </div>
          <button type="button" className="btn btn-primary" onClick={() => setShowRegister(true)}>
            스토어 등록
          </button>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>플랫폼</th>
                <th>스토어명</th>
                <th>쇼핑몰 셀러ID</th>
                <th>소속 회사</th>
                <th>API 연동</th>
                <th>사용 여부</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#888' }}>
                    {stores.length === 0 ? '등록된 스토어가 없습니다. 스토어 등록 버튼을 클릭하세요.' : '검색 결과가 없습니다.'}
                  </td>
                </tr>
              ) : (
                filteredStores.map((s) => (
                  <tr key={s.uid}>
                    <td>{s.mallName}</td>
                    <td>{s.name}</td>
                    <td>{s.mallSellerId || '-'}</td>
                    <td>{s.companyName || '-'}</td>
                    <td>
                      <span className={`badge badge-${s.hasAuth ? 'active' : 'inactive'}`}>
                        {s.hasAuth ? '연동됨' : '미연동'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${s.enabled ? 'active' : 'inactive'}`}>
                        {s.enabled ? '사용' : '미사용'}
                      </span>
                    </td>
                    <td className="cell-actions">
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() => setEditingStore(s)}
                      >
                        수정
                      </button>
                      <button
                        type="button"
                        className="btn-link text-danger"
                        onClick={() => handleDelete(s)}
                        disabled={deleting === s.uid}
                      >
                        {deleting === s.uid ? '삭제 중...' : '삭제'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showRegister && (
        <StoreRegisterModal
          malls={malls}
          companies={companies}
          onClose={() => setShowRegister(false)}
          onSaved={loadData}
        />
      )}

      {editingStore && (
        <StoreEditModal
          store={editingStore}
          companies={companies}
          onClose={() => setEditingStore(null)}
          onSaved={loadData}
        />
      )}
    </div>
  );
}
