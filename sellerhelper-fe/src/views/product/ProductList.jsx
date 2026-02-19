'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from '@/components/Link';
import { fetchProducts } from '@/services/product.service';
import { useStoreStore, useUserStoreStore } from '@/stores';
import { buildStoreTabs, getStoreColumns, getProductValue } from '@/config/productStoreTabs';
import '../../styles/Settings.css';
import './ProductList.css';

function formatFetchedAt(date) {
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

export default function ProductList() {
  const { stores } = useStoreStore();
  const { userStores } = useUserStoreStore();
  const storeTabs = buildStoreTabs({ stores, userStores });

  const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeTab, setStoreTab] = useState(storeTabs[0]?.key ?? '');
  const [fetchedAt, setFetchedAt] = useState(null);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  /* 스토어 탭이 바뀌면(연동 스토어 로드 등) 첫 번째 탭 선택 */
  useEffect(() => {
    if (storeTabs.length > 0 && !storeTabs.some((t) => t.key === storeTab)) {
      setStoreTab(storeTabs[0].key);
    }
  }, [storeTabs, storeTab]);

  /* 스토어 탭 또는 페이지 크기 변경 시 1페이지로 */
  useEffect(() => {
    setCurrentPage(1);
  }, [storeTab, pageSize]);

  const loadProducts = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchProducts()
      .then((data) => {
        setProducts(Array.isArray(data) ? data : []);
        setFetchedAt(new Date());
      })
      .catch((err) => {
        setError(err.message || '상품을 불러오는데 실패했습니다.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts =
    storeTab && storeTabs.length > 0
      ? products.filter((p) => (p.store ?? '스마트스토어') === storeTab)
      : products;

  const totalCount = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const pagedProducts = filteredProducts.slice(startIdx, startIdx + pageSize);

  const columns = getStoreColumns(storeTab);

  function renderCell(p, col) {
    const v = getProductValue(p, col.key, storeTab);
    switch (col.type) {
      case 'image':
        return v ? (
          <img src={v} alt="" style={{ width: 48, height: 48, objectFit: 'cover' }} />
        ) : (
          <span style={{ color: '#999' }}>-</span>
        );
      case 'price':
        return `₩${(v ?? 0).toLocaleString()}`;
      case 'stock':
        return `${v ?? 0}개`;
      case 'badge':
        return (
          <span className={`badge badge-${v === '판매중' ? 'active' : 'inactive'}`}>
            {v ?? '-'}
          </span>
        );
      default:
        return v ?? '-';
    }
  }

  return (
    <div className="list-page">
      <h1>상품 목록</h1>
      <p className="page-desc">등록된 상품을 조회·관리합니다.</p>
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
            <input
              type="text"
              placeholder="상품명 검색"
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <select style={{ padding: '6px 12px', marginRight: 8 }} aria-label="전체 상태">
              <option value="">전체 상태</option>
              <option value="on">판매중</option>
              <option value="out">품절</option>
              <option value="stop">판매중지</option>
            </select>
            <button type="button" className="btn">
              검색
            </button>
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
              onClick={() => window.location.reload()}
              title="페이지 새로고침"
            >
              새로고침
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={loadProducts}
              disabled={loading}
              title="API에서 상품 데이터 다시 가져오기"
            >
              가져오기
            </button>
            <Link to="/product/register" className="btn btn-primary">
              상품 등록
            </Link>
          </div>
        </div>
        {error && (
          <div className="error-message" style={{ padding: 12, marginBottom: 16, background: '#fee', color: '#c00', borderRadius: 6 }}>
            {error}
          </div>
        )}
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center' }}>상품 목록을 불러오는 중...</p>
        ) : (
          <div className="settings-table-wrap">
            <table className="settings-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th key={col.key}>{col.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} style={{ padding: 24, textAlign: 'center' }}>
                      조회된 상품이 없습니다.
                    </td>
                  </tr>
                ) : (
                  pagedProducts.map((p) => (
                    <tr key={p.id || p.productNo}>
                      {columns.map((col) => (
                        <td key={col.key}>{renderCell(p, col)}</td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {!loading && totalCount > 0 && (
              <div className="product-list-pagination">
                <span className="product-list-pagination-info">
                  전체 {totalCount.toLocaleString()}건 중 {startIdx + 1}–{Math.min(startIdx + pageSize, totalCount)}건
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
                  <span className="product-list-page-nums">
                    {(() => {
                      const maxVisible = 5;
                      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                      let end = Math.min(totalPages, start + maxVisible - 1);
                      if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
                      const pages = [];
                      if (start > 1) {
                        pages.push(
                          <button key={1} type="button" className="product-list-page-num" onClick={() => setCurrentPage(1)}>
                            1
                          </button>
                        );
                        if (start > 2) pages.push(<span key="ell1" className="product-list-page-ell">…</span>);
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
                        if (end < totalPages - 1) pages.push(<span key="ell2" className="product-list-page-ell">…</span>);
                        pages.push(
                          <button key={totalPages} type="button" className="product-list-page-num" onClick={() => setCurrentPage(totalPages)}>
                            {totalPages}
                          </button>
                        );
                      }
                      return pages;
                    })()}
                  </span>
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
