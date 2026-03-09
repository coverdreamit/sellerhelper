'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from '@/components/Link';
import { fetchStoreShippings, syncStoreShippings } from '@/services/myStore.service';
import { useMyStoreStore } from '@/stores';
import { buildStoreTabs } from '@/config/productStoreTabs';
import type { ShippingListItem } from '@/services/myStore.service';
import '../../styles/Settings.css';
import '../product/ProductList.css';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];

function formatOrderDate(orderDate: string | null): string {
  if (!orderDate) return '-';
  const d = new Date(orderDate);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ShippingList() {
  const { myStores } = useMyStoreStore();
  const storeTabs = buildStoreTabs(myStores);

  const [storeTab, setStoreTab] = useState(storeTabs[0]?.key ?? '');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [list, setList] = useState<ShippingListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const selectedTab = storeTabs.find((t) => t.key === storeTab);

  const loadShippings = useCallback(() => {
    if (!selectedTab?.storeUid) {
      setList([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchStoreShippings(selectedTab.storeUid, currentPage, pageSize, statusFilter || undefined)
      .then((res) => {
        setList(res.contents ?? []);
        setTotalCount(Number(res.totalCount) ?? 0);
      })
      .catch((err) => {
        setError(err?.message || '배송 목록을 불러오는데 실패했습니다.');
        setList([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [selectedTab?.storeUid, currentPage, pageSize, statusFilter]);

  useEffect(() => {
    if (storeTabs.length > 0 && !storeTabs.some((t) => t.key === storeTab)) {
      setStoreTab(storeTabs[0].key);
    }
  }, [storeTabs, storeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [storeTab, pageSize, statusFilter]);

  useEffect(() => {
    loadShippings();
  }, [loadShippings]);

  const handleSync = () => {
    if (!selectedTab?.storeUid) return;
    setSyncing(true);
    syncStoreShippings(selectedTab.storeUid)
      .then(() => loadShippings())
      .catch((err) => setError(err?.message || '동기화에 실패했습니다.'))
      .finally(() => setSyncing(false));
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIdx = (currentPage - 1) * pageSize;

  function renderPagination() {
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

  return (
    <div className="list-page">
      <h1>배송 목록</h1>
      <p className="page-desc">전체 배송 건을 조회·관리합니다. 동기화 후 DB에 저장된 목록이 표시됩니다.</p>
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '6px 12px', marginRight: 8 }}
            >
              <option value="">전체 상태</option>
              <option value="pending">출고대기</option>
              <option value="shipping">배송중</option>
              <option value="done">배송완료</option>
            </select>
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
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleSync}
              disabled={!selectedTab?.storeUid || syncing}
            >
              {syncing ? '동기화 중…' : '배송 목록 동기화'}
            </button>
            <Link to="/shipping/pending" className="btn btn-primary">
              출고 대기
            </Link>
          </div>
        </div>
        {error && (
          <div style={{ padding: 12, marginBottom: 12, background: '#f8d7da', color: '#721c24', borderRadius: 4 }}>
            {error}
          </div>
        )}
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>스토어</th>
                <th>수령인</th>
                <th>상태</th>
                <th>송장번호</th>
                <th>주문일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>
                    불러오는 중…
                  </td>
                </tr>
              ) : list.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>
                    조회된 배송 건이 없습니다. 위 &quot;배송 목록 동기화&quot;를 실행하면 네이버 등 플랫폼에서 주문/배송 데이터를 가져와 저장합니다.
                  </td>
                </tr>
              ) : (
                list.map((s) => (
                  <tr key={s.orderId}>
                    <td>
                      <Link to={`/order/${s.orderId}`}>{s.orderId}</Link>
                    </td>
                    <td>{s.storeName}</td>
                    <td>{s.receiverName ?? '-'}</td>
                    <td>
                      <span className="badge badge-active">{s.status}</span>
                    </td>
                    <td>{s.invoice}</td>
                    <td>{formatOrderDate(s.orderDate)}</td>
                    <td className="cell-actions">
                      <Link to={`/order/${s.orderId}`}>상세</Link>
                      {s.status === '출고대기' && <Link to="/shipping/invoice">송장 입력</Link>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalCount > 0 && !loading && (
            <div className="product-list-pagination">
              <span className="product-list-pagination-info">
                전체 {totalCount.toLocaleString()}건 중 {startIdx + 1}–
                {Math.min(startIdx + pageSize, totalCount)}건
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
                <span className="product-list-page-nums">{renderPagination()}</span>
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
      </section>
    </div>
  );
}
