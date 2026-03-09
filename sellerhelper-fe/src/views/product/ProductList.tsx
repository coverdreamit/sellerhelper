'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from '@/components/Link';
import { fetchStoreProducts, syncStoreProducts } from '@/services/myStore.service';
import { useMyStoreStore } from '@/stores';
import { buildStoreTabs, getStoreColumns, getProductValue } from '@/config/productStoreTabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const { myStores } = useMyStoreStore();
  const storeTabs = useMemo(() => buildStoreTabs(myStores), [myStores]);

  const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50, 100];

  const [products, setProducts] = useState<Record<string, unknown>[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storeTab, setStoreTab] = useState(storeTabs[0]?.key ?? '');
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [syncing, setSyncing] = useState(false);

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

  /** 네이버 스토어 상품 API 응답 → 테이블용 형식 변환 (백엔드/API 필드명 모두 허용) */
  const toTableProduct = (
    p:
      | Record<string, unknown>
      | {
          channelProductNo?: string;
          productName?: string;
          channelProductName?: string;
          optionName?: string;
          salePrice?: number;
          stockQuantity?: number;
          statusType?: string;
          representativeImageUrl?: string;
        },
    _storeLabel: string,
    filterValue: string
  ) => {
    const baseName = String(p.productName ?? p.channelProductName ?? '').trim() || '-';
    const optionName = String((p as Record<string, unknown>).optionName ?? p.optionName ?? '').trim();
    const name = optionName ? `${baseName} (${optionName})` : baseName;
    const statusType = String(p.statusType ?? (p as Record<string, unknown>).channelProductStatusType ?? '');
    const rawPrice = p.salePrice ?? (p as Record<string, unknown>).sale_price;
    const rawStock = p.stockQuantity ?? (p as Record<string, unknown>).stock_quantity ?? (p as Record<string, unknown>).quantity;
    const price = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice) || 0;
    const stock = typeof rawStock === 'number' ? rawStock : Number(rawStock) || 0;
    const status =
      statusType === 'SALE' || statusType === 'ON' ? '판매중'
        : statusType === 'OUTOFSTOCK' ? '품절'
          : statusType === 'SUSPENSION' ? '판매중지'
            : /승인|approved|sale/i.test(String(statusType)) ? '판매중'
              : /품절|outofstock|out_of_stock/i.test(String(statusType)) ? '품절'
                : /중지|suspension/i.test(String(statusType)) ? '판매중지'
                  : statusType || '-';
    return {
      id: p.channelProductNo ?? (p as Record<string, unknown>).channel_product_no,
      productNo: p.channelProductNo ?? (p as Record<string, unknown>).channel_product_no,
      name,
      imageUrl: p.representativeImageUrl ?? (p as Record<string, unknown>).representative_image_url,
      price,
      stock,
      status,
      store: filterValue,
    };
  };

  const loadProducts = useCallback(() => {
    const tab = storeTabs.find((t) => t.key === storeTab);
    if (!tab || tab.storeUid == null) {
      setProducts([]);
      setTotalCount(0);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchStoreProducts(tab.storeUid, currentPage, pageSize)
      .then((res) => {
        const items = (res.contents ?? []).map((p) => toTableProduct(p, tab.label, tab.filterValue));
        setProducts(items);
        setTotalCount(res.totalCount ?? 0);
        setFetchedAt(res.lastSyncedAt ? new Date(res.lastSyncedAt) : null);
      })
      .catch((err) => {
        setError(err?.message || '상품을 불러오는데 실패했습니다.');
        setProducts([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [storeTab, storeTabs, currentPage, pageSize]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const selectedTab = storeTabs.find((t) => t.key === storeTab);
  const filterValue = selectedTab?.filterValue ?? storeTab;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pagedProducts = products;

  const columns = getStoreColumns(filterValue);

  function renderCell(p, col) {
    const v = getProductValue(p, col.key, filterValue);
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
            <Input
              type="text"
              placeholder="상품명 검색"
              className="h-9 w-[200px]"
            />
            <select className="select-shadcn" aria-label="전체 상태" style={{ marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="on">판매중</option>
              <option value="out">품절</option>
              <option value="stop">판매중지</option>
            </select>
            <Button type="button" variant="secondary" size="sm">
              검색
            </Button>
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadProducts}
              disabled={loading}
              title="상품 목록만 다시 불러오기"
            >
              새로고침
            </Button>
            {['NAVER', 'COUPANG'].includes(selectedTab?.mallCode ?? '') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!selectedTab?.storeUid) return;
                  setSyncing(true);
                  setError(null);
                  try {
                    await syncStoreProducts(selectedTab.storeUid);
                    await loadProducts();
                  } catch (e) {
                    setError(e?.message ?? '상품 목록 동기화에 실패했습니다.');
                  } finally {
                    setSyncing(false);
                  }
                }}
                disabled={loading || syncing}
                title="플랫폼 API에서 상품 목록을 가져와 DB에 저장합니다"
              >
                {syncing ? '동기화 중…' : '상품 목록 동기화'}
              </Button>
            )}
            <Button asChild>
              <Link to="/product/register">상품 등록</Link>
            </Button>
          </div>
        </div>
        {error && (
          <div className="form-error">
            {error}
          </div>
        )}
        {loading ? (
          <p className="empty-state">상품 목록을 불러오는 중...</p>
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
                    <td colSpan={columns.length} className="empty-state">
                      {selectedTab?.mallCode === 'NAVER'
                        ? '조회된 상품이 없습니다. 네이버 스마트스토어에 등록된 상품을 불러옵니다.'
                        : selectedTab?.mallCode === 'COUPANG'
                          ? '조회된 상품이 없습니다. 쿠팡 WING에 등록된 상품을 불러옵니다.'
                          : selectedTab
                            ? `조회된 상품이 없습니다. ${selectedTab.mallName}에 등록된 상품을 불러옵니다.`
                            : '스토어를 연동해 주세요.'}
                    </td>
                  </tr>
                ) : (
                  pagedProducts.map((p, idx) => (
                    <tr key={String(p.id ?? p.productNo ?? idx)}>
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
                  전체 {totalCount.toLocaleString()}건 중 {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, totalCount)}건
                </span>
                <div className="product-list-pagination-btns">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="product-list-page-btn h-9 w-9"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage <= 1}
                    aria-label="처음 페이지"
                  >
                    «
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="product-list-page-btn h-9 w-9"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                    aria-label="이전 페이지"
                  >
                    ‹
                  </Button>
                  <span className="product-list-page-nums">
                    {(() => {
                      const maxVisible = 5;
                      let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
                      let end = Math.min(totalPages, start + maxVisible - 1);
                      if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);
                      const pages = [];
                      if (start > 1) {
                        pages.push(
                          <Button
                            key={1}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="product-list-page-num min-w-8 h-8 p-0"
                            onClick={() => setCurrentPage(1)}
                          >
                            1
                          </Button>
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
                          <Button
                            key={n}
                            type="button"
                            variant={currentPage === n ? 'default' : 'outline'}
                            size="sm"
                            className={`product-list-page-num min-w-8 h-8 p-0 ${currentPage === n ? 'active' : ''}`}
                            onClick={() => setCurrentPage(n)}
                          >
                            {n}
                          </Button>
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
                          <Button
                            key={totalPages}
                            type="button"
                            variant="outline"
                            size="sm"
                            className="product-list-page-num min-w-8 h-8 p-0"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        );
                      }
                      return pages;
                    })()}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="product-list-page-btn h-9 w-9"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                    aria-label="다음 페이지"
                  >
                    ›
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="product-list-page-btn h-9 w-9"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage >= totalPages}
                    aria-label="마지막 페이지"
                  >
                    »
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
