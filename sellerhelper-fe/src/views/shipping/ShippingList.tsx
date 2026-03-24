'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from '@/components/Link';
import { useMyStoreStore, useVendorStore } from '@/stores';
import { buildStoreTabs } from '@/config/productStoreTabs';
import { fetchShippingList, SHIPPING_STATUS, type ShippingListItem } from '@/services/shipping.service';
import { syncOrdersFromNaver } from '@/services/order.service';
import {
  exportPurchaseOrderExcel,
  downloadBlob,
} from '@/services/purchaseOrder.service';
import { loadSupplierPoColumnKeys } from '@/utils/supplierPoFormStorage';
import '../../styles/Settings.css';
import '../product/ProductList.css';

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: '전체 상태' },
  { value: SHIPPING_STATUS.PAYED, label: '출고대기' },
  { value: SHIPPING_STATUS.DELIVERING, label: '배송중' },
  { value: SHIPPING_STATUS.DELIVERED, label: '배송완료' },
];

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

function orderStatusLabel(status: string): string {
  if (status === SHIPPING_STATUS.PAYED) return '출고대기';
  if (status === SHIPPING_STATUS.DELIVERING) return '배송중';
  if (status === SHIPPING_STATUS.DELIVERED) return '배송완료';
  return status || '-';
}

function formatStampForFilename(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

export default function ShippingList() {
  const { myStores } = useMyStoreStore();
  const { vendors, loadVendors } = useVendorStore();
  const storeTabs = buildStoreTabs(myStores);

  const [storeTab, setStoreTab] = useState(storeTabs[0]?.key ?? '');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderStatusFilter, setOrderStatusFilter] = useState('');
  const [list, setList] = useState<ShippingListItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUids, setSelectedUids] = useState<Set<number>>(new Set());
  const [poVendorId, setPoVendorId] = useState<number | ''>('');
  const [exporting, setExporting] = useState(false);

  const selectedTab = storeTabs.find((t) => t.key === storeTab);
  const isNaverStore = selectedTab?.mallCode === 'NAVER';

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  useEffect(() => {
    if (vendors.length === 0) {
      setPoVendorId('');
      return;
    }
    const exists = vendors.some((v) => v.vendorId === poVendorId);
    if (poVendorId === '' || !exists) {
      setPoVendorId(vendors[0].vendorId);
    }
  }, [vendors, poVendorId]);

  useEffect(() => {
    if (storeTabs.length > 0 && !storeTabs.some((t) => t.key === storeTab)) {
      setStoreTab(storeTabs[0].key);
    }
  }, [storeTabs, storeTab]);

  useEffect(() => {
    setSelectedUids(new Set());
  }, [storeTab, currentPage, pageSize, orderStatusFilter]);

  const loadShipping = useCallback(async () => {
    if (!storeTab || storeTabs.length === 0) {
      setList([]);
      setTotalElements(0);
      setTotalPages(0);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const page = currentPage - 1;
      const orderStatus = orderStatusFilter.trim() || undefined;
      const data = await fetchShippingList(Number(storeTab), page, pageSize, orderStatus);
      setList(data.content);
      setTotalElements(data.totalElements);
      setTotalPages(data.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : '배송 목록 조회 실패');
      setList([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [storeTab, currentPage, pageSize, orderStatusFilter, storeTabs.length]);

  useEffect(() => {
    loadShipping();
  }, [loadShipping]);

  /** 네이버 주문 동기화 (같은 DB를 쓰므로 주문 동기화 후 배송 목록에 반영됨) */
  async function handleSync() {
    if (!storeTab || !isNaverStore) return;
    setSyncing(true);
    setError(null);
    try {
      const count = await syncOrdersFromNaver(Number(storeTab));
      await loadShipping();
      if (count > 0) setCurrentPage(1);
    } catch (e) {
      setError(e instanceof Error ? e.message : '주문 동기화 실패');
    } finally {
      setSyncing(false);
    }
  }

  function handleRefresh() {
    if (isNaverStore) loadShipping();
  }

  useEffect(() => {
    setCurrentPage(1);
  }, [storeTab, pageSize, orderStatusFilter]);

  const totalCount = totalElements;
  const startIdx = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;

  const selectedVendorName = useMemo(() => {
    if (poVendorId === '') return '';
    return vendors.find((v) => v.vendorId === poVendorId)?.vendorName ?? '';
  }, [vendors, poVendorId]);

  const toggleSelect = useCallback((uid: number, checked: boolean) => {
    setSelectedUids((prev) => {
      const next = new Set(prev);
      if (checked) next.add(uid);
      else next.delete(uid);
      return next;
    });
  }, []);

  const toggleSelectAllOnPage = useCallback(
    (checked: boolean) => {
      setSelectedUids((prev) => {
        const next = new Set(prev);
        list.forEach((row) => {
          if (checked) next.add(row.uid);
          else next.delete(row.uid);
        });
        return next;
      });
    },
    [list]
  );

  const allOnPageSelected =
    list.length > 0 && list.every((row) => selectedUids.has(row.uid));

  async function handleExportPurchaseOrder() {
    if (!storeTab || poVendorId === '') {
      setError('발주업체를 선택하세요.');
      return;
    }
    const uids = [...selectedUids];
    if (uids.length === 0) {
      setError('발주서로 내보낼 주문을 선택하세요.');
      return;
    }
    const columnKeys = loadSupplierPoColumnKeys(String(poVendorId));
    setExporting(true);
    setError(null);
    try {
      const blob = await exportPurchaseOrderExcel(Number(storeTab), {
        vendorId: Number(poVendorId),
        orderUids: uids,
        columnKeys,
      });
      const safeName = (selectedVendorName || '발주').replace(/[\\/:*?"<>|]/g, '_');
      downloadBlob(blob, `발주서_${safeName}_${formatStampForFilename(new Date())}.xlsx`);
    } catch (e) {
      setError(e instanceof Error ? e.message : '발주서 생성에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  }

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
      <p className="page-desc">
        전체 배송 건을 조회·관리합니다. 네이버 스토어 탭에서 &quot;데이터 동기화&quot;로 최신 주문을 DB에 반영한 뒤, 주문을 선택하고
        발주업체를 고르면 발주양식관리에 저장된 컬럼 순서로 발주서 엑셀을 받을 수 있습니다. (스마트스토어 엑셀과 동일한 필드
        의미, 데이터는 동기화된 주문·상품행 기준입니다.)
      </p>
      <section className="settings-section">
        <div className="product-list-tabs-wrap">
          <div className="product-list-tabs">
            {storeTabs.length === 0 ? (
              <p style={{ padding: 8, color: '#666' }}>
                스토어를 연동하면 배송 목록을 조회할 수 있습니다.
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
                <select
                  style={{ padding: '6px 12px', marginRight: 8 }}
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  aria-label="배송 상태 필터"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value || 'all'} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginRight: 8 }}>
                  <span style={{ fontSize: 13, whiteSpace: 'nowrap' }}>발주업체</span>
                  <select
                    style={{ padding: '6px 10px', minWidth: 140 }}
                    value={poVendorId === '' ? '' : String(poVendorId)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPoVendorId(v === '' ? '' : Number(v));
                    }}
                    aria-label="발주업체"
                  >
                    {vendors.length === 0 ? (
                      <option value="">등록된 발주업체 없음</option>
                    ) : (
                      vendors.map((v) => (
                        <option key={v.vendorId} value={String(v.vendorId)}>
                          {v.vendorName}
                        </option>
                      ))
                    )}
                  </select>
                </label>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleExportPurchaseOrder}
                  disabled={exporting || loading || vendors.length === 0 || poVendorId === ''}
                  title="발주양식관리에 저장된 컬럼 순서로 엑셀을 만듭니다."
                >
                  {exporting ? '발주서 생성 중…' : '발주서 엑셀 다운로드'}
                </button>
                {isNaverStore && (
                  <>
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
                  </>
                )}
                <Link to="/shipping/pending" className="btn btn-primary">
                  출고 대기
                </Link>
              </div>
            </div>
            {error && (
              <p style={{ color: '#c00', padding: '8px 0', margin: 0 }}>{error}</p>
            )}
            <div className="settings-table-wrap">
              <table className="settings-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>
                      <input
                        type="checkbox"
                        checked={allOnPageSelected}
                        onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
                        aria-label="현재 페이지 전체 선택"
                        disabled={list.length === 0 || loading}
                      />
                    </th>
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
                      <td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>
                        조회 중…
                      </td>
                    </tr>
                  ) : list.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>
                        조회된 배송 건이 없습니다. 주문 목록에서 네이버 주문 동기화 후 배송 목록을 조회할 수 있습니다.
                      </td>
                    </tr>
                  ) : (
                    list.map((row) => (
                      <tr key={row.uid}>
                        <td>
                          <input
                            type="checkbox"
                            checked={selectedUids.has(row.uid)}
                            onChange={(e) => toggleSelect(row.uid, e.target.checked)}
                            aria-label={`주문 ${row.mallOrderNo} 선택`}
                          />
                        </td>
                        <td>
                          <Link to={`/order/${row.uid}`}>{row.mallOrderNo}</Link>
                        </td>
                        <td>{row.storeName ?? '-'}</td>
                        <td>{row.receiverName ?? '-'}</td>
                        <td>
                          <span
                            className={`badge badge-${row.orderStatus === SHIPPING_STATUS.DELIVERED ? 'active' : 'inactive'}`}
                          >
                            {orderStatusLabel(row.orderStatus)}
                          </span>
                        </td>
                        <td>-</td>
                        <td>{formatOrderDate(row.orderDate)}</td>
                        <td className="cell-actions">
                          <Link to={`/order/${row.uid}`}>상세</Link>
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
                {Math.min((currentPage - 1) * pageSize + pageSize, totalCount)}건
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
