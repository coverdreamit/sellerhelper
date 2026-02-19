'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/Link';
import { useStoreStore, useUserStoreStore } from '@/stores';
import { buildStoreTabs } from '@/config/productStoreTabs';
import '../../styles/Settings.css';
import '../product/ProductList.css';

const mockClaims = [
  { id: 'CLM-001', orderId: 'ORD-2024-101', store: '스마트스토어', type: '취소', amount: 35000, status: '요청접수', date: '2024-02-06 13:20' },
  { id: 'CLM-002', orderId: 'ORD-2024-098', store: '쿠팡', type: '반품', amount: 52000, status: '처리중', date: '2024-02-06 11:45' },
  { id: 'CLM-003', orderId: 'ORD-2024-095', store: '스마트스토어', type: '교환', amount: 28000, status: '요청접수', date: '2024-02-06 10:10' },
  { id: 'CLM-004', orderId: 'ORD-2024-090', store: '11번가', type: '취소', amount: 15000, status: '처리완료', date: '2024-02-06 09:00' },
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

export default function OrderClaim() {
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
      ? mockClaims.filter((c) => (c.store ?? '스마트스토어') === storeTab)
      : mockClaims;

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const paged = filtered.slice(startIdx, startIdx + pageSize);

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
          <Link to="/settings/store/list" className="product-list-tab-manage">탭 관리</Link>
        </div>
        <div className="settings-toolbar">
          <div className="product-list-left">
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 유형</option>
              <option value="cancel">취소</option>
              <option value="return">반품</option>
              <option value="exchange">교환</option>
            </select>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="request">요청접수</option>
              <option value="processing">처리중</option>
              <option value="done">처리완료</option>
            </select>
            <input type="text" placeholder="주문번호/클레임번호 검색" style={{ padding: '6px 12px', marginRight: 8 }} />
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
              {paged.length === 0 ? (
                <tr><td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>조회된 클레임이 없습니다.</td></tr>
              ) : (
                paged.map((c) => (
                  <tr key={c.id}>
                    <td><Link to={`/order/${c.orderId}`}>{c.id}</Link></td>
                    <td><Link to={`/order/${c.orderId}`}>{c.orderId}</Link></td>
                    <td>{c.store}</td>
                    <td><span className={`badge ${c.type === '취소' ? 'badge-inactive' : 'badge-active'}`}>{c.type}</span></td>
                    <td>₩{c.amount.toLocaleString()}</td>
                    <td>{c.status}</td>
                    <td>{c.date}</td>
                    <td className="cell-actions">
                      <Link to={`/order/${c.orderId}`}>상세</Link>
                      <a href="#처리">처리</a>
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
