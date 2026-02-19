'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/Link';
import { useStoreStore, useUserStoreStore } from '@/stores';
import { buildStoreTabs } from '@/config/productStoreTabs';
import '../../styles/Settings.css';
import '../product/ProductList.css';

const mockComplete = [
  { orderId: 'ORD-2024-004', store: '스마트스토어', buyer: '박*민', carrier: 'CJ대한통운', invoice: '1234567888', delivered: '2024-02-06 18:00' },
  { orderId: 'ORD-2024-003', store: '쿠팡', buyer: '이*호', carrier: '한진택배', invoice: '1111222233', delivered: '2024-02-06 17:30' },
  { orderId: 'ORD-2024-002', store: '11번가', buyer: '김*수', carrier: 'CJ대한통운', invoice: '4444555566', delivered: '2024-02-06 16:00' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];

function renderPagination(totalPages, currentPage, setCurrentPage) {
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
  const pages = [];
  if (start > 1) {
    pages.push(<button key={1} type="button" className="product-list-page-num" onClick={() => setCurrentPage(1)}>1</button>);
    if (start > 2) pages.push(<span key="ell1" className="product-list-page-ell">…</span>);
  }
  for (let n = start; n <= end; n++) {
    pages.push(
      <button key={n} type="button" className={`product-list-page-num ${currentPage === n ? 'active' : ''}`} onClick={() => setCurrentPage(n)}>
        {n}
      </button>
    );
  }
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push(<span key="ell2" className="product-list-page-ell">…</span>);
    pages.push(<button key={totalPages} type="button" className="product-list-page-num" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>);
  }
  return pages;
}

export default function ShippingComplete() {
  const { stores } = useStoreStore();
  const { userStores } = useUserStoreStore();
  const storeTabs = buildStoreTabs({ stores, userStores });

  const [storeTab, setStoreTab] = useState(storeTabs[0]?.key ?? '');
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (storeTabs.length > 0 && !storeTabs.some((t) => t.key === storeTab)) {
      setStoreTab(storeTabs[0].key);
    }
  }, [storeTabs, storeTab]);

  useEffect(() => {
    setCurrentPage(1);
  }, [storeTab, pageSize]);

  const filtered =
    storeTab && storeTabs.length > 0
      ? mockComplete.filter((s) => (s.store ?? '스마트스토어') === storeTab)
      : mockComplete;

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const paged = filtered.slice(startIdx, startIdx + pageSize);

  return (
    <div className="list-page">
      <h1>배송 완료</h1>
      <p className="page-desc">배송 완료된 건을 조회합니다.</p>
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
          <Link to="/settings/store/list" className="product-list-tab-manage">탭 관리</Link>
        </div>
        <div className="settings-toolbar">
          <div className="product-list-left">
            <input type="date" style={{ padding: '6px 12px', marginRight: 8 }} />
            <input type="text" placeholder="주문번호 검색" style={{ padding: '6px 12px', marginRight: 8 }} />
            <button type="button" className="btn">검색</button>
            <label className="product-list-page-size">
              <span>한 화면에 보기</span>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}개</option>)}
              </select>
            </label>
          </div>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>스토어</th>
                <th>수령인</th>
                <th>택배사</th>
                <th>송장번호</th>
                <th>배송완료일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>배송 완료 건이 없습니다.</td></tr>
              ) : (
                paged.map((s) => (
                  <tr key={s.orderId}>
                    <td><Link to={`/order/${s.orderId}`}>{s.orderId}</Link></td>
                    <td>{s.store}</td>
                    <td>{s.buyer}</td>
                    <td>{s.carrier}</td>
                    <td>{s.invoice}</td>
                    <td>{s.delivered}</td>
                    <td className="cell-actions">
                      <Link to={`/order/${s.orderId}`}>상세</Link>
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
                <button type="button" className="btn btn-outline product-list-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage <= 1}>«</button>
                <button type="button" className="btn btn-outline product-list-page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}>‹</button>
                <span className="product-list-page-nums">{renderPagination(totalPages, currentPage, setCurrentPage)}</span>
                <button type="button" className="btn btn-outline product-list-page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>›</button>
                <button type="button" className="btn btn-outline product-list-page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages}>»</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
