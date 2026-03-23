'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from '@/components/Link';
import { useMyStoreStore } from '@/stores';
import { buildStoreTabs } from '@/config/productStoreTabs';
import {
  fetchOrderList,
  syncOrdersFromNaver,
  fetchAllVendorOrderForms,
  type OrderListItem,
  type VendorOrderFormDto,
} from '@/services';
import { buildOrderExportCsv, downloadCsvFile } from '@/utils/orderExportCsv';
import '../../styles/Settings.css';
import '../product/ProductList.css';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];

function formatOrderDate(iso: string | null | undefined): string {
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

export default function OrderList() {
  const { myStores } = useMyStoreStore();
  const allTabs = buildStoreTabs(myStores);
  const storeTabs = allTabs; // 모든 스토어 탭 표시 (호출은 네이버만)

  const [storeTab, setStoreTab] = useState(storeTabs[0]?.key ?? '');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedUids, setSelectedUids] = useState<Set<number>>(() => new Set());
  const [orderForms, setOrderForms] = useState<VendorOrderFormDto[]>([]);
  const [selectedFormUid, setSelectedFormUid] = useState('');
  const headerCheckboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchAllVendorOrderForms();
        if (!cancelled) setOrderForms(list);
      } catch {
        if (!cancelled) setOrderForms([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSelectedUids(new Set());
  }, [storeTab, currentPage]);

  useEffect(() => {
    const el = headerCheckboxRef.current;
    if (!el) return;
    const allPageSelected =
      orders.length > 0 && orders.every((o) => selectedUids.has(o.uid));
    const somePageSelected = orders.some((o) => selectedUids.has(o.uid));
    el.indeterminate = somePageSelected && !allPageSelected;
  }, [orders, selectedUids]);

  useEffect(() => {
    if (storeTabs.length > 0 && !storeTabs.some((t) => t.key === storeTab)) {
      setStoreTab(storeTabs[0].key);
    }
  }, [storeTabs, storeTab]);

  const loadOrders = useCallback(async () => {
    if (!storeTab || storeTabs.length === 0) {
      setOrders([]);
      setTotalElements(0);
      setTotalPages(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const page = currentPage - 1;
      const data = await fetchOrderList(Number(storeTab), page, pageSize);
      setOrders(data.content ?? []);
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : '주문 목록 조회 실패');
      setOrders([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [storeTab, currentPage, pageSize, storeTabs.length]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function handleSync() {
    if (!storeTab) return;
    setSyncing(true);
    setError(null);
    try {
      const count = await syncOrdersFromNaver(Number(storeTab));
      await loadOrders();
      if (count > 0) {
        setCurrentPage(1);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '주문 동기화 실패');
    } finally {
      setSyncing(false);
    }
  }

  function handleRefresh() {
    loadOrders();
  }

  const allPageSelected =
    orders.length > 0 && orders.every((o) => selectedUids.has(o.uid));

  function toggleAllPage() {
    setSelectedUids((prev) => {
      const next = new Set(prev);
      if (allPageSelected) {
        orders.forEach((o) => next.delete(o.uid));
      } else {
        orders.forEach((o) => next.add(o.uid));
      }
      return next;
    });
  }

  function toggleOne(uid: number) {
    setSelectedUids((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  }

  function handleExportCsv() {
    const form = orderForms.find((f) => f.formUid === Number(selectedFormUid));
    if (!form?.columnKeys?.length) {
      alert('발주양식 관리에서 저장한 양식을 선택하세요.');
      return;
    }
    const picked = orders.filter((o) => selectedUids.has(o.uid));
    if (picked.length === 0) {
      alert('현재 페이지에서 내보낼 주문을 선택하세요.');
      return;
    }
    const csv = buildOrderExportCsv(picked, form.columnKeys);
    const safe = form.formName.replace(/[\\/:*?"<>|]/g, '_');
    downloadCsvFile(csv, `orders_${safe}_${new Date().toISOString().slice(0, 10)}.csv`);
  }

  const totalCount = totalElements;
  const startIdx = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endIdx = Math.min((currentPage - 1) * pageSize + pageSize, totalCount);

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
      <h1>주문 목록</h1>
      <p className="page-desc">
        스토어별 주문을 조회합니다. 주문 조회·동기화는 네이버 스마트스토어만 지원됩니다. 체크한 행만 발주
        양식(CSV)으로 내보낼 수 있습니다.
      </p>
      <section className="settings-section">
        <div className="product-list-tabs-wrap">
          <div className="product-list-tabs">
            {storeTabs.length === 0 ? (
              <p style={{ padding: 8, color: '#666' }}>
                스토어를 연동하면 주문 목록 탭이 표시됩니다.
              </p>
            ) : (
              storeTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`product-list-tab ${storeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setStoreTab(tab.key)}
                >
                  {tab.label}
                </button>
              ))
            )}
          </div>
          <Link to="/settings/store/list" className="product-list-tab-manage">
            탭 관리
          </Link>
        </div>
        {storeTabs.length > 0 && (
          <>
            <div className="settings-toolbar">
              <div className="product-list-left">
                <label className="product-list-page-size">
                  <span>한 화면에 보기</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
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
                  onClick={handleRefresh}
                  disabled={loading}
                  aria-label="목록 새로고침"
                >
                  새로고침
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSync}
                  disabled={syncing || loading}
                >
                  {syncing ? '동기화 중…' : '데이터 동기화'}
                </button>
              </div>
            </div>
            {error && (
              <p style={{ color: '#c00', padding: '8px 0', margin: 0 }}>{error}</p>
            )}
            <div
              className="settings-toolbar"
              style={{
                marginTop: 8,
                flexWrap: 'wrap',
                gap: 12,
                alignItems: 'center',
              }}
            >
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span>발주 양식</span>
                <select
                  value={selectedFormUid}
                  onChange={(e) => setSelectedFormUid(e.target.value)}
                  style={{ minWidth: 240, padding: '6px 10px' }}
                  aria-label="저장된 발주 양식 선택"
                >
                  <option value="">선택</option>
                  {orderForms
                    .filter((f) => f.active)
                    .map((f) => (
                      <option key={f.formUid} value={String(f.formUid)}>
                        {f.vendorName} — {f.formName}
                      </option>
                    ))}
                </select>
              </label>
              <button type="button" className="btn btn-outline" onClick={handleExportCsv}>
                선택 주문 CSV 내보내기
              </button>
              <Link to="/settings/supplier/forms?tab=orders" className="btn-link" style={{ fontSize: '0.875rem' }}>
                발주업체별 주문
              </Link>
              <Link to="/settings/supplier/forms" className="btn-link" style={{ fontSize: '0.875rem' }}>
                양식 관리
              </Link>
              <span style={{ color: '#666', fontSize: '0.875rem' }}>
                현재 페이지에서 선택한 주문만 CSV에 포함됩니다.
              </span>
            </div>
            <div className="settings-table-wrap">
              <table className="settings-table">
                <thead>
                  <tr>
                    <th style={{ width: 44 }}>
                      <input
                        ref={headerCheckboxRef}
                        type="checkbox"
                        checked={allPageSelected}
                        onChange={toggleAllPage}
                        aria-label="현재 페이지 전체 선택"
                      />
                    </th>
                    <th>주문번호</th>
                    <th>스토어</th>
                    <th>주문자</th>
                    <th>연락처</th>
                    <th>주문금액</th>
                    <th>상태</th>
                    <th>주문일시</th>
                    <th>상품수</th>
                    <th>수령인</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={11} style={{ padding: 24, textAlign: 'center' }}>
                        조회 중…
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={11} style={{ padding: 24, textAlign: 'center' }}>
                        조회된 주문이 없습니다. &quot;데이터 동기화&quot;로 최근 24시간
                        변경분을 불러오세요.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.uid}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedUids.has(o.uid)}
                            onChange={() => toggleOne(o.uid)}
                            aria-label={`주문 ${o.mallOrderNo} 선택`}
                          />
                        </td>
                        <td>
                          <Link to={`/order/${o.uid}?storeUid=${o.storeUid}`}>{o.mallOrderNo}</Link>
                        </td>
                        <td>{o.storeName ?? '-'}</td>
                        <td>{o.buyerName ?? '-'}</td>
                        <td>{o.buyerPhone ?? '-'}</td>
                        <td>
                          {o.totalAmount != null
                            ? `₩${Number(o.totalAmount).toLocaleString()}`
                            : '-'}
                        </td>
                        <td>
                          <span
                            className={`badge badge-${o.orderStatus === 'DELIVERED' ? 'active' : 'inactive'}`}
                          >
                            {o.orderStatus ?? '-'}
                          </span>
                        </td>
                        <td>{formatOrderDate(o.orderDate)}</td>
                        <td>{o.itemCount ?? '-'}</td>
                        <td>{o.receiverName ?? '-'}</td>
                        <td className="cell-actions">
                          <Link to={`/order/${o.uid}?storeUid=${o.storeUid}`}>상세</Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {totalCount > 0 && !loading && (
                <div className="product-list-pagination">
                  <span className="product-list-pagination-info">
                    전체 {totalCount.toLocaleString()}건 중 {startIdx}–
                    {endIdx}건
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
          </>
        )}
      </section>
    </div>
  );
}
