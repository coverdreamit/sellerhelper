'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from '@/components/Link';
import { fetchStoreProducts, syncStoreProducts } from '@/services/myStore.service';
import { useMyStoreStore } from '@/stores';
import { buildStoreTabs } from '@/config/productStoreTabs';
import '../../styles/Settings.css';
import './ProductList.css';
import './ProductListRaw.css';

function formatFetchedAt(date: Date | null) {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function renderRawValue(value: unknown) {
  if (value == null || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default function ProductListRaw() {
  const { myStores } = useMyStoreStore();
  const storeTabs = useMemo(() => buildStoreTabs(myStores), [myStores]);

  const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];

  const [rawProducts, setRawProducts] = useState<Record<string, unknown>[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeTab, setStoreTab] = useState(storeTabs[0]?.key ?? '');
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (storeTabs.length > 0 && !storeTabs.some((t) => t.key === storeTab)) {
      setStoreTab(storeTabs[0].key);
    }
  }, [storeTabs, storeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [storeTab, pageSize]);

  const loadProducts = useCallback(() => {
    const tab = storeTabs.find((t) => t.key === storeTab);
    if (!tab || tab.storeUid == null) {
      setRawProducts([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    fetchStoreProducts(tab.storeUid, currentPage, pageSize)
      .then((res) => {
        const items = Array.isArray(res.contents) ? (res.contents as Record<string, unknown>[]) : [];
        setRawProducts(items);
        setTotalCount(res.totalCount ?? 0);
        setFetchedAt(res.lastSyncedAt ? new Date(res.lastSyncedAt) : null);
      })
      .catch((err) => {
        setError(err?.message || '원본 상품 데이터 조회에 실패했습니다.');
        setRawProducts([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [storeTab, storeTabs, currentPage, pageSize]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const selectedTab = storeTabs.find((t) => t.key === storeTab);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const rawColumns = useMemo(() => {
    const keySet = new Set<string>();
    rawProducts.forEach((row) => {
      Object.keys(row ?? {}).forEach((key) => keySet.add(key));
    });
    return Array.from(keySet);
  }, [rawProducts]);

  return (
    <div className="list-page">
      <h1>상품목록 원본</h1>
      <p className="page-desc">상품 API에서 가져온 원본 데이터를 그대로 조회합니다.</p>
      <section className="settings-section">
        <div className="product-list-tabs-wrap">
          <div className="product-list-tabs">
            {storeTabs.map((tab) => (
              <button
                key={tab.key || 'all'}
                type="button"
                className={`product-list-tab ${storeTab === tab.key ? 'active' : ''}`}
                onClick={() => setStoreTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link to="/settings/store/list" className="product-list-tab-manage">
            탭 관리
          </Link>
        </div>
        <div className="settings-toolbar">
          <div className="product-list-left">
            <label className="product-list-page-size">
              <span>한 화면에 보기</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                aria-label="페이지당 행 개수"
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}개
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="product-list-actions">
            <span className="product-list-fetched">가져온 시간: {formatFetchedAt(fetchedAt)}</span>
            <button
              type="button"
              className="btn btn-outline"
              onClick={loadProducts}
              disabled={loading}
              title="원본 목록 다시 불러오기"
            >
              새로고침
            </button>
            {['NAVER', 'COUPANG'].includes(selectedTab?.mallCode ?? '') && (
              <button
                type="button"
                className="btn btn-outline"
                onClick={async () => {
                  if (!selectedTab?.storeUid) return;
                  setSyncing(true);
                  setError(null);
                  try {
                    await syncStoreProducts(selectedTab.storeUid);
                    await loadProducts();
                  } catch (e) {
                    setError(e?.message ?? '원본 데이터 동기화에 실패했습니다.');
                  } finally {
                    setSyncing(false);
                  }
                }}
                disabled={loading || syncing}
                title="플랫폼 API에서 상품 목록을 가져와 DB에 저장합니다"
              >
                {syncing ? '동기화 중…' : '상품 목록 동기화'}
              </button>
            )}
          </div>
        </div>
        {error && (
          <div
            className="error-message"
            style={{
              padding: 12,
              marginBottom: 16,
              background: '#fee',
              color: '#c00',
              borderRadius: 6,
            }}
          >
            {error}
          </div>
        )}
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center' }}>원본 상품 데이터를 불러오는 중...</p>
        ) : (
          <div className="settings-table-wrap product-list-raw-wrap">
            <div className="product-list-raw-head">
              <h2>API 원본 데이터</h2>
              <span>현재 페이지 기준 {rawProducts.length}건</span>
            </div>
            <table className="settings-table product-list-raw-table">
              <thead>
                <tr>
                  {rawColumns.length > 0 ? rawColumns.map((key) => <th key={key}>{key}</th>) : <th>데이터</th>}
                </tr>
              </thead>
              <tbody>
                {rawProducts.length === 0 ? (
                  <tr>
                    <td colSpan={Math.max(rawColumns.length, 1)} style={{ padding: 24, textAlign: 'center' }}>
                      API에서 조회된 원본 데이터가 없습니다.
                    </td>
                  </tr>
                ) : (
                  rawProducts.map((row, rowIdx) => (
                    <tr key={String(row.channelProductNo ?? row.id ?? rowIdx)}>
                      {rawColumns.map((key) => (
                        <td key={`${rowIdx}-${key}`}>{renderRawValue(row[key])}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!loading && totalCount > 0 && (
              <div className="product-list-pagination">
                <span className="product-list-pagination-info">
                  전체 {totalCount.toLocaleString()}건 중 {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, totalCount)}건
                </span>
                <div className="product-list-pagination-btns">
                  <button
                    type="button"
                    className="btn btn-outline product-list-page-btn"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage <= 1}
                    aria-label="처음 페이지"
                  >
                    «
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline product-list-page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    aria-label="이전 페이지"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline product-list-page-btn"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    aria-label="다음 페이지"
                  >
                    ›
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline product-list-page-btn"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage >= totalPages}
                    aria-label="마지막 페이지"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
