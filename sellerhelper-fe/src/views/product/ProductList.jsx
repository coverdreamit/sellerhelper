'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from '@/components/Link';
import { fetchProducts } from '@/services/product.service';
import '../../styles/Settings.css';
import './ProductList.css';

const STORE_TABS = [
  { key: '', label: '전체' },
  { key: '스마트스토어', label: '스마트스토어' },
];

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
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeTab, setStoreTab] = useState('');
  const [fetchedAt, setFetchedAt] = useState(null);

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

  const filteredProducts = storeTab
    ? products.filter((p) => (p.store ?? '스마트스토어') === storeTab)
    : products;

  return (
    <div className="list-page">
      <h1>상품 목록</h1>
      <p className="page-desc">등록된 상품을 조회·관리합니다.</p>
      <section className="settings-section">
        <div className="product-list-tabs">
          {STORE_TABS.map((tab) => (
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
        <div className="settings-toolbar">
          <div>
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
                  <th>이미지</th>
                  <th>상품명</th>
                  <th>스토어</th>
                  <th>판매가</th>
                  <th>재고</th>
                  <th>상태</th>
                  <th>수정일</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: 24, textAlign: 'center' }}>
                      조회된 상품이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((p) => (
                    <tr key={p.id || p.productNo}>
                      <td>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt=""
                            style={{ width: 48, height: 48, objectFit: 'cover' }}
                          />
                        ) : (
                          <span style={{ color: '#999' }}>-</span>
                        )}
                      </td>
                      <td>{p.name}</td>
                      <td>{p.store ?? '스마트스토어'}</td>
                      <td>₩{(p.price ?? 0).toLocaleString()}</td>
                      <td>{p.stock ?? 0}개</td>
                      <td>
                        <span
                          className={`badge badge-${p.status === '판매중' ? 'active' : 'inactive'}`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>{p.updated ?? '-'}</td>
                      <td className="cell-actions">
                        <Link to={`/product/edit?id=${p.productNo}`}>수정</Link>
                        <Link to={`/product/stock?id=${p.productNo}`}>재고/품절</Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
