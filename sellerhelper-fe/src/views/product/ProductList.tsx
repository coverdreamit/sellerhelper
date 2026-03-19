'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from '@/components/Link';
import { downloadStoreProductsExcel, fetchStoreProducts, syncStoreProducts } from '@/services/myStore.service';
import { useMyStoreStore } from '@/stores';
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

function flattenObjectToColumns(
  value: unknown,
  prefix = '',
  out: Record<string, unknown> = {}
): Record<string, unknown> {
  if (value == null) {
    if (prefix) out[prefix] = '';
    return out;
  }
  if (Array.isArray(value)) {
    if (value.length === 0 && prefix) out[prefix] = '[]';
    value.forEach((item, idx) => {
      const next = prefix ? `${prefix}[${idx}]` : `[${idx}]`;
      flattenObjectToColumns(item, next, out);
    });
    return out;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0 && prefix) {
      out[prefix] = '{}';
      return out;
    }
    entries.forEach(([key, item]) => {
      const next = prefix ? `${prefix}.${key}` : key;
      flattenObjectToColumns(item, next, out);
    });
    return out;
  }
  if (prefix) out[prefix] = value;
  return out;
}

const DETAIL_COLUMN_LABEL_MAP: Record<string, string> = {
  imageUrl: '이미지 URL',
  representativeImageUrl: '대표 이미지 URL',
  name: '상품명',
  productName: '상품명',
  channelProductName: '채널 상품명',
  productNo: '상품번호',
  channelProductNo: '채널 상품번호',
  sellerProductId: '판매자 상품 ID',
  vendorItemId: '옵션 ID',
  salePrice: '판매가',
  originalPrice: '정가',
  price: '가격',
  stock: '재고',
  stockQuantity: '재고 수량',
  quantity: '수량',
  status: '상태',
  statusType: '상태 타입',
  displayStatus: '전시 상태',
  channelProductDisplayStatusType: '채널 전시 상태',
  categoryId: '카테고리 ID',
  leafCategoryId: '카테고리 ID',
  optionName: '옵션명',
  updated: '수정일',
  updatedAt: '수정일시',
  modifiedAt: '수정일시',
  syncedAt: '동기화 시각',
  store: '스토어',
  id: 'ID',
  rawPayload: '원본 데이터',
  raw_payload: '원본 데이터',
};

const RAW_SEGMENT_LABEL_MAP: Record<string, string> = {
  detailPayload: '상세정보',
  listPayload: '목록정보',
  channelProduct: '채널상품',
  groupProductNo: '그룹상품번호',
  originProductNo: '원상품번호',
  channelProductNo: '채널상품번호',
  sellerManagementCode: '판매자상품코드',
  channelProductDisplayStatusType: '전시상태',
  statusType: '상태',
  salePrice: '판매가',
  stockQuantity: '재고수량',
  categoryId: '카테고리ID',
  representativeImage: '대표이미지',
  modifiedDate: '수정일시',
  name: '상품명',
  url: 'URL',
  id: 'ID',
};

function splitCamelCase(value: string) {
  return value.replace(/([a-z0-9])([A-Z])/g, '$1 $2');
}

function toHumanRawSegment(segment: string) {
  const noArray = segment.replace(/\[\d+\]/g, '');
  const direct = RAW_SEGMENT_LABEL_MAP[noArray];
  if (direct) return direct;
  const words = splitCamelCase(noArray)
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === 'status') return '상태';
      if (lower === 'type') return '타입';
      if (lower === 'display') return '전시';
      if (lower === 'product') return '상품';
      if (lower === 'channel') return '채널';
      if (lower === 'sale') return '판매';
      if (lower === 'price') return '가격';
      if (lower === 'stock') return '재고';
      if (lower === 'quantity') return '수량';
      if (lower === 'image') return '이미지';
      if (lower === 'category') return '카테고리';
      if (lower === 'modified') return '수정';
      if (lower === 'date') return '일시';
      return word;
    });
  return words.join(' ');
}

function toKoreanDetailLabel(key: string) {
  if (DETAIL_COLUMN_LABEL_MAP[key]) {
    return DETAIL_COLUMN_LABEL_MAP[key];
  }
  if (key.startsWith('raw.')) {
    const rawKey = key.replace(/^raw\./, '');
    const label = rawKey
      .split('.')
      .filter(Boolean)
      .map((segment) => toHumanRawSegment(segment))
      .join(' > ');
    return label || '상세정보';
  }
  return splitCamelCase(key);
}

function shouldHideDetailColumn(key: string) {
  // 정규화된 기본 컬럼(name/price/stock/status/image 등)과 중복되는 raw channelProduct 계열은 숨김
  if (
    key.startsWith('raw.channelProduct.') ||
    key.startsWith('raw.detailPayload.channelProduct.')
  ) {
    return true;
  }
  return false;
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
  const [viewMode, setViewMode] = useState<'simple' | 'detail'>('simple');

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
    const rawPayloadValue =
      (p as Record<string, unknown>).rawPayload ?? (p as Record<string, unknown>).raw_payload;
    let parsedRawPayload: Record<string, unknown> = {};
    if (typeof rawPayloadValue === 'string' && rawPayloadValue.trim()) {
      try {
        const parsed = JSON.parse(rawPayloadValue);
        parsedRawPayload = flattenObjectToColumns(parsed, 'raw');
      } catch {
        parsedRawPayload = { rawPayload: rawPayloadValue };
      }
    } else if (rawPayloadValue && typeof rawPayloadValue === 'object') {
      parsedRawPayload = flattenObjectToColumns(rawPayloadValue, 'raw');
    }
    const baseName = String(p.productName ?? p.channelProductName ?? '').trim() || '-';
    const optionName = String(
      (p as Record<string, unknown>).optionName ?? p.optionName ?? ''
    ).trim();
    const name = optionName ? `${baseName} (${optionName})` : baseName;
    const statusType = String(
      p.statusType ?? (p as Record<string, unknown>).channelProductStatusType ?? ''
    );
    const rawPrice = p.salePrice ?? (p as Record<string, unknown>).sale_price;
    const rawStock =
      p.stockQuantity ??
      (p as Record<string, unknown>).stock_quantity ??
      (p as Record<string, unknown>).quantity;
    const price = typeof rawPrice === 'number' ? rawPrice : Number(rawPrice) || 0;
    const stock = typeof rawStock === 'number' ? rawStock : Number(rawStock) || 0;
    const status =
      statusType === 'SALE' || statusType === 'ON'
        ? '판매중'
        : statusType === 'OUTOFSTOCK'
          ? '품절'
          : statusType === 'SUSPENSION'
            ? '판매중지'
            : /승인|approved|sale/i.test(String(statusType))
              ? '판매중'
              : /품절|outofstock|out_of_stock/i.test(String(statusType))
                ? '품절'
                : /중지|suspension/i.test(String(statusType))
                  ? '판매중지'
                  : statusType || '-';
    return {
      ...(p as Record<string, unknown>),
      ...parsedRawPayload,
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
        const items = (res.contents ?? []).map((p) =>
          toTableProduct(p, tab.label, tab.filterValue)
        );
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
  const simpleColumns = getStoreColumns(filterValue);
  const detailColumns = useMemo(() => {
    const priorityKeys = [
      'imageUrl',
      'representativeImageUrl',
      'name',
      'productName',
      'channelProductName',
      'productNo',
      'channelProductNo',
      'price',
      'salePrice',
      'stock',
      'stockQuantity',
      'status',
      'statusType',
      'displayStatus',
      'updated',
      'updatedAt',
      'modifiedAt',
      'store',
    ];
    const detected = new Set<string>();
    pagedProducts.forEach((row) => {
      Object.keys((row as Record<string, unknown>) ?? {}).forEach((key) => detected.add(key));
    });
    const orderedKeys = [
      ...priorityKeys.filter((key) => detected.has(key)),
      ...Array.from(detected).filter((key) => !priorityKeys.includes(key)),
    ].filter((key) => !shouldHideDetailColumn(key));
    if (orderedKeys.length === 0) {
      return simpleColumns;
    }
    return orderedKeys.map((key) => {
      if (/image/i.test(key)) return { key, label: toKoreanDetailLabel(key), type: 'image' };
      if (/price|amount|cost/i.test(key)) return { key, label: toKoreanDetailLabel(key), type: 'price' };
      if (/stock|quantity|qty/i.test(key)) return { key, label: toKoreanDetailLabel(key), type: 'stock' };
      if (/status/i.test(key)) return { key, label: toKoreanDetailLabel(key), type: 'badge' };
      return { key, label: toKoreanDetailLabel(key), type: 'text' };
    });
  }, [pagedProducts, simpleColumns]);
  const columns = viewMode === 'detail' ? detailColumns : simpleColumns;

  function renderCell(p, col) {
    const v = getProductValue(p, col.key, filterValue);
    const asText = v == null || v === '' ? '-' : typeof v === 'object' ? JSON.stringify(v) : String(v);
    switch (col.type) {
      case 'image':
        if (!v) return <span style={{ color: '#999' }}>-</span>;
        return (
          <span
            style={{
              display: 'inline-flex',
              width: 48,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={v}
              alt=""
              style={{ width: 48, height: 48, objectFit: 'cover' }}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const span = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (span) span.style.display = 'inline';
              }}
            />
            <span style={{ display: 'none', fontSize: 11, color: '#999' }}>이미지 없음</span>
          </span>
        );
      case 'price':
        if (v == null || v === '' || Number.isNaN(Number(v))) return asText;
        return `₩${Number(v).toLocaleString()}`;
      case 'stock':
        if (v == null || v === '' || Number.isNaN(Number(v))) return asText;
        return `${Number(v).toLocaleString()}개`;
      case 'badge':
        return (
          <span className={`badge badge-${v === '판매중' ? 'active' : 'inactive'}`}>
            {asText}
          </span>
        );
      default:
        return asText;
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
            <div className="product-list-view-toggle" role="tablist" aria-label="상품 목록 보기 모드">
              <button
                type="button"
                className={`product-list-view-btn ${viewMode === 'simple' ? 'active' : ''}`}
                onClick={() => setViewMode('simple')}
                aria-pressed={viewMode === 'simple'}
              >
                단순 보기
              </button>
              <button
                type="button"
                className={`product-list-view-btn ${viewMode === 'detail' ? 'active' : ''}`}
                onClick={() => setViewMode('detail')}
                aria-pressed={viewMode === 'detail'}
              >
                상세 보기
              </button>
            </div>
          </div>
          <div className="product-list-actions">
            <span className="product-list-fetched">가져온 시간: {formatFetchedAt(fetchedAt)}</span>
            <button
              type="button"
              className="btn btn-outline"
              onClick={loadProducts}
              disabled={loading}
              title="상품 목록만 다시 불러오기"
            >
              새로고침
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={async () => {
                if (!selectedTab?.storeUid) return;
                try {
                  await downloadStoreProductsExcel(selectedTab.storeUid);
                } catch (e) {
                  setError(e?.message ?? '상품목록 엑셀 다운로드에 실패했습니다.');
                }
              }}
              disabled={loading || syncing}
              title="동기화된 상품목록을 엑셀 파일로 다운로드합니다"
            >
              상품목록 다운로드
            </button>
            {['NAVER', 'COUPANG'].includes(selectedTab?.mallCode ?? '') && (
              <button
                type="button"
                className="btn btn-outline"
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
              </button>
            )}
          </div>
        </div>
        {error && (
          <div
            className="error-message"
            style={{
              padding: 12,
              marginBottom: 16,
              background: '#fee',
              color: '#c00',
              borderRadius: 6,
            }}
          >
            {error}
          </div>
        )}
        {loading ? (
          <p style={{ padding: 24, textAlign: 'center' }}>상품 목록을 불러오는 중...</p>
        ) : (
          <div className={`settings-table-wrap ${viewMode === 'detail' ? 'product-list-table-detail' : ''}`}>
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
