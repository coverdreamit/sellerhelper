'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from '@/components/Link';
import { useMyStoreStore } from '@/stores';
import { buildStoreTabs } from '@/config/productStoreTabs';
import { fetchClaimList, syncOrdersFromNaver, type ClaimListItem } from '@/services/order.service';
import '../../styles/Settings.css';
import '../product/ProductList.css';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];

function renderPagination(totalPages, currentPage, setCurrentPage) {
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  const pages = [];
  if (start > 1) {
    pages.push(
      <button
        key={1}
        type="button"
        className="product-list-page-num"
        onClick={() => setCurrentPage(1)}
      >
        1
      </button>
    );
    if (start > 2)
      pages.push(
        <span key="ell1" className="product-list-page-ell">
          …
        </span>
      );
  }
  for (let n = start; n <= end; n++) {
    pages.push(
      <button
        key={n}
        type="button"
        className={`product-list-page-num ${currentPage === n ? 'active' : ''}`}
        onClick={() => setCurrentPage(n)}
      >
        {n}
      </button>
    );
  }
  if (end < totalPages) {
    if (end < totalPages - 1)
      pages.push(
        <span key="ell2" className="product-list-page-ell">
          …
        </span>
      );
    pages.push(
      <button
        key={totalPages}
        type="button"
        className="product-list-page-num"
        onClick={() => setCurrentPage(totalPages)}
      >
        {totalPages}
      </button>
    );
  }
  return pages;
}

function formatClaimDate(iso: string | null | undefined): string {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(iso);
  }
}

function claimTypeLabel(claimType: string): string {
  if (claimType === 'CANCEL') return '취소';
  if (claimType === 'RETURN') return '반품';
  if (claimType === 'EXCHANGE') return '교환';
  return claimType || '-';
}

export default function OrderClaim() {
  const { myStores } = useMyStoreStore();
  const storeTabs = buildStoreTabs(myStores);

  const [storeTab, setStoreTab] = useState(storeTabs[0]?.key ?? '');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [claimTypeFilter, setClaimTypeFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [paged, setPaged] = useState<ClaimListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (storeTabs.length > 0 && !storeTabs.some((t) => t.key === storeTab)) {
      setStoreTab(storeTabs[0].key);
    }
  }, [storeTabs, storeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [storeTab, pageSize, claimTypeFilter, searchKeyword]);

  const loadClaims = useCallback(async () => {
    if (!storeTab || storeTabs.length === 0) {
      setPaged([]);
      setTotalCount(0);
      setTotalPages(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const page = currentPage - 1;
      const data = await fetchClaimList(
        Number(storeTab),
        page,
        pageSize,
        claimTypeFilter.trim() || undefined,
        searchKeyword.trim() || undefined
      );
      setPaged(data.content ?? []);
      setTotalCount(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : '취소/반품/교환 목록 조회 실패');
      setPaged([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [storeTab, currentPage, pageSize, claimTypeFilter, searchKeyword, storeTabs.length]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  async function handleSync() {
    if (!storeTab) return;
    setSyncing(true);
    setError(null);
    try {
      await syncOrdersFromNaver(Number(storeTab));
      await loadClaims();
      setCurrentPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : '주문 동기화 실패');
    } finally {
      setSyncing(false);
    }
  }

  function handleSearch() {
    setSearchKeyword(keyword);
    setCurrentPage(1);
  }

  const startIdx = totalCount > 0 ? (currentPage - 1) * pageSize : 0;

  return (
    <div className="list-page">
      <h1>취소 / 반품 / 교환</h1>
      <p className="page-desc">취소·반품·교환 요청을 조회하고 처리합니다.</p>
      <section className="settings-section">
        <div className="product-list-tabs-wrap">
          <div className="product-list-tabs">
            {storeTabs.map((tab) => (
              <button
                key={tab.key}
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
            <select
              value={claimTypeFilter}
              onChange={(e) => setClaimTypeFilter(e.target.value)}
              style={{ padding: '6px 12px', marginRight: 8 }}
            >
              <option value="">전체 유형</option>
              <option value="cancel">취소</option>
              <option value="return">반품</option>
              <option value="exchange">교환</option>
            </select>
            <input
              type="text"
              placeholder="주문번호/클레임번호 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <button type="button" className="btn" onClick={handleSearch}>
              검색
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleSync}
              disabled={syncing || !storeTab}
              style={{ marginLeft: 8 }}
            >
              {syncing ? '동기화 중…' : '주문 동기화'}
            </button>
            <label className="product-list-page-size">
              <span>한 화면에 보기</span>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}개
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>클레임번호</th>
                <th>주문번호</th>
                <th>스토어</th>
                <th>유형</th>
                <th>금액</th>
                <th>상태</th>
                <th>신청일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>
                    조회 중…
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: 'center', color: 'var(--danger, #c00)' }}>
                    {error}
                  </td>
                </tr>
              ) : paged.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>
                    취소·반품·교환 데이터가 없습니다. 주문 동기화 후 조회할 수 있습니다.
                  </td>
                </tr>
              ) : (
                paged.map((row) => (
                  <tr key={row.orderItemUid}>
                    <td>{row.mallItemId ?? '-'}</td>
                    <td>{row.mallOrderNo ?? '-'}</td>
                    <td>{row.storeName ?? '-'}</td>
                    <td>{claimTypeLabel(row.claimType)}</td>
                    <td>{row.totalPrice != null ? Number(row.totalPrice).toLocaleString() : '-'}</td>
                    <td>{row.productOrderStatus ?? '-'}</td>
                    <td>{formatClaimDate(row.orderDate)}</td>
                    <td>
                      <Link to={`/order/${row.orderUid}`}>상세</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalCount > 0 && (
            <div className="product-list-pagination">
              <span className="product-list-pagination-info">
                전체 {totalCount}건 중 {startIdx + 1}–{Math.min(startIdx + pageSize, totalCount)}건
              </span>
              <div className="product-list-pagination-btns">
                <button
                  type="button"
                  className="btn btn-outline product-list-page-btn"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage <= 1}
                >
                  «
                </button>
                <button
                  type="button"
                  className="btn btn-outline product-list-page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                >
                  ‹
                </button>
                <span className="product-list-page-nums">
                  {renderPagination(totalPages, currentPage, setCurrentPage)}
                </span>
                <button
                  type="button"
                  className="btn btn-outline product-list-page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                >
                  ›
                </button>
                <button
                  type="button"
                  className="btn btn-outline product-list-page-btn"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage >= totalPages}
                >
                  »
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
