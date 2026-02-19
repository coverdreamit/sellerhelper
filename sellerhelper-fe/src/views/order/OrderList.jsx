'use client';

import { useState, useEffect } from 'react';
import Link from '@/components/Link';
import { useStoreStore, useUserStoreStore } from '@/stores';
import { buildStoreTabs } from '@/config/productStoreTabs';
import '../../styles/Settings.css';
import '../product/ProductList.css';

const mockOrders = [
  { id: 'ORD-2024-001', store: '스마트스토어', buyer: '홍*동', amount: 45000, status: '출고대기', date: '2024-02-06 14:32' },
  { id: 'ORD-2024-002', store: '쿠팡', buyer: '김*수', amount: 32000, status: '배송중', date: '2024-02-06 13:15' },
  { id: 'ORD-2024-003', store: '11번가', buyer: '이*영', amount: 78000, status: '신규주문', date: '2024-02-06 12:48' },
  { id: 'ORD-2024-004', store: '스마트스토어', buyer: '박*민', amount: 25600, status: '배송완료', date: '2024-02-06 11:20' },
  { id: 'ORD-2024-005', store: '쿠팡', buyer: '최*호', amount: 18900, status: '신규주문', date: '2024-02-06 10:05' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];

export default function OrderList() {
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

  const filteredOrders =
    storeTab && storeTabs.length > 0
      ? mockOrders.filter((o) => (o.store ?? '스마트스토어') === storeTab)
      : mockOrders;

  const totalCount = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const pagedOrders = filteredOrders.slice(startIdx, startIdx + pageSize);

  function renderPagination() {
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

  return (
    <div className="list-page">
      <h1>주문 목록</h1>
      <p className="page-desc">전체 주문을 조회·관리합니다.</p>
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
            <input type="text" placeholder="주문번호/주문자 검색" style={{ padding: '6px 12px', marginRight: 8 }} />
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="new">신규주문</option>
              <option value="pending">출고대기</option>
              <option value="shipping">배송중</option>
              <option value="done">배송완료</option>
            </select>
            <input type="date" style={{ padding: '6px 12px', marginRight: 8 }} />
            <button type="button" className="btn">
              검색
            </button>
            <label className="product-list-page-size">
              <span>한 화면에 보기</span>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} aria-label="페이지당 행 개수">
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}개</option>
                ))}
              </select>
            </label>
          </div>
          <div className="product-list-actions">
            <Link to="/order/new" className="btn btn-primary">
              신규 주문
            </Link>
          </div>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>스토어</th>
                <th>주문자</th>
                <th>주문금액</th>
                <th>상태</th>
                <th>주문일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 24, textAlign: 'center' }}>
                    조회된 주문이 없습니다.
                  </td>
                </tr>
              ) : (
                pagedOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/order/${o.id}`}>{o.id}</Link>
                    </td>
                    <td>{o.store}</td>
                    <td>{o.buyer}</td>
                    <td>₩{o.amount.toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-${o.status === '배송완료' ? 'active' : 'inactive'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td>{o.date}</td>
                    <td className="cell-actions">
                      <Link to={`/order/${o.id}`}>상세</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {totalCount > 0 && (
            <div className="product-list-pagination">
              <span className="product-list-pagination-info">
                전체 {totalCount.toLocaleString()}건 중 {startIdx + 1}–{Math.min(startIdx + pageSize, totalCount)}건
              </span>
              <div className="product-list-pagination-btns">
                <button type="button" className="btn btn-outline product-list-page-btn" onClick={() => setCurrentPage(1)} disabled={currentPage <= 1} aria-label="처음 페이지">«</button>
                <button type="button" className="btn btn-outline product-list-page-btn" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1} aria-label="이전 페이지">‹</button>
                <span className="product-list-page-nums">{renderPagination()}</span>
                <button type="button" className="btn btn-outline product-list-page-btn" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} aria-label="다음 페이지">›</button>
                <button type="button" className="btn btn-outline product-list-page-btn" onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages} aria-label="마지막 페이지">»</button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
