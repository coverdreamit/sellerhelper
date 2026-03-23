'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from '@/components/Link';
import { useMyStoreStore, useVendorStore } from '@/stores';
import { fetchStoreProducts, type NaverProductItem } from '@/services/myStore.service';
import {
  fetchAllVendorOrderForms,
  updateVendorOrderForm,
  type VendorOrderFormDto,
} from '@/services/vendorOrderForm.service';
import {
  PURCHASE_ORDER_EXPORT_COLUMNS,
  DEFAULT_PURCHASE_ORDER_COLUMN_KEYS,
  getPurchaseExportLabel,
} from '@/constants/purchaseOrderExportFields';
import '../../../styles/Settings.css';
import './SupplierFormManage.css';

const PAGE_SIZE = 50;
const PRODUCT_FETCH_SIZE = 200;
const LS_PREFIX = 'sh.vendorLine.cols:';
const FORM_CTX_PREFIX = 'sh.vendorForm.ctx:';

interface VendorOrdersPanelProps {
  selectedFormName?: string | null;
  defaultVendorUid?: number | null;
  formUid?: number | null;
  previewMode?: boolean;
}

function getAssignedVendorUid(item: NaverProductItem): number | null {
  const raw = item as unknown as Record<string, unknown>;
  const v = item.assignedVendorUid ?? raw.assignedVendorUid ?? raw.assigned_vendor_uid;
  const n = typeof v === 'number' ? v : typeof v === 'string' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : null;
}

function toProductRow(item: NaverProductItem): Record<string, unknown> {
  const raw = item as unknown as Record<string, unknown>;
  return {
    채널상품번호: item.channelProductNo ?? raw.channel_product_no ?? '-',
    상품명: item.productName ?? raw.product_name ?? '-',
    판매가: item.salePrice ?? raw.sale_price ?? '-',
    재고: item.stockQuantity ?? raw.stock_quantity ?? '-',
    상태: item.statusType ?? raw.status_type ?? '-',
    옵션상품번호: item.vendorItemId ?? raw.vendor_item_id ?? '-',
    발주업체: item.assignedVendorName ?? raw.assigned_vendor_name ?? '-',
  };
}

export default function VendorOrdersPanel({
  selectedFormName = null,
  defaultVendorUid = null,
  formUid = null,
  previewMode = false,
}: VendorOrdersPanelProps) {
  const { myStores, loadMyStores, loading: storesLoading } = useMyStoreStore();
  const { vendors, loadVendors } = useVendorStore();

  const [storeUid, setStoreUid] = useState('');
  const [vendorUid, setVendorUid] = useState('');
  const [page, setPage] = useState(0);
  const [allRows, setAllRows] = useState<Record<string, unknown>[]>([]);
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingPreset, setSavingPreset] = useState(false);
  const [targetForm, setTargetForm] = useState<VendorOrderFormDto | null>(null);
  const [selectedOrderKeys, setSelectedOrderKeys] = useState<Set<string>>(
    () => new Set(DEFAULT_PURCHASE_ORDER_COLUMN_KEYS)
  );

  const selectedStore = useMemo(
    () => myStores.find((s) => String(s.uid) === storeUid),
    [myStores, storeUid]
  );
  const isNaverStore = (selectedStore?.mallCode ?? '').toUpperCase() === 'NAVER';
  const productKeys = useMemo(() => (rows.length > 0 ? Object.keys(rows[0]) : []), [rows]);
  const orderCatalogKeys = useMemo(
    () => PURCHASE_ORDER_EXPORT_COLUMNS.map((c) => c.key),
    []
  );

  useEffect(() => {
    void loadMyStores();
    void loadVendors();
  }, [loadMyStores, loadVendors]);

  useEffect(() => {
    if (defaultVendorUid == null) return;
    setVendorUid(String(defaultVendorUid));
    setPage(0);
  }, [defaultVendorUid]);

  useEffect(() => {
    if (!formUid || !storeUid || !vendorUid || previewMode) return;
    try {
      localStorage.setItem(
        `${FORM_CTX_PREFIX}${formUid}`,
        JSON.stringify({ storeUid, vendorUid })
      );
    } catch {
      /* ignore */
    }
  }, [formUid, storeUid, vendorUid, previewMode]);

  useEffect(() => {
    if (!previewMode || !formUid) return;
    try {
      const raw = localStorage.getItem(`${FORM_CTX_PREFIX}${formUid}`);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { storeUid?: string; vendorUid?: string };
      if (parsed.storeUid) setStoreUid(parsed.storeUid);
      if (parsed.vendorUid) setVendorUid(parsed.vendorUid);
      setPage(0);
    } catch {
      /* ignore */
    }
  }, [previewMode, formUid]);

  useEffect(() => {
    if (formUid == null) {
      setTargetForm(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const forms = await fetchAllVendorOrderForms();
        if (cancelled) return;
        const found = forms.find((f) => f.formUid === formUid) ?? null;
        setTargetForm(found);
        if (found?.purchaseColumnKeys?.length) {
          setSelectedOrderKeys(new Set(found.purchaseColumnKeys));
        }
      } catch {
        if (!cancelled) setTargetForm(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [formUid]);

  useEffect(() => {
    if (!storeUid || !vendorUid) return;
    try {
      const raw = localStorage.getItem(`${LS_PREFIX}${storeUid}:${vendorUid}`);
      if (!raw) return;
      const arr = JSON.parse(raw) as unknown;
      if (!Array.isArray(arr) || arr.length === 0) return;
      setSelectedOrderKeys(
        new Set(arr.filter((k): k is string => typeof k === 'string' && orderCatalogKeys.includes(k)))
      );
    } catch {
      /* ignore */
    }
  }, [storeUid, vendorUid, orderCatalogKeys]);

  useEffect(() => {
    if (!storeUid || !vendorUid) return;
    const keys = orderCatalogKeys.filter((k) => selectedOrderKeys.has(k));
    if (keys.length === 0) return;
    try {
      localStorage.setItem(`${LS_PREFIX}${storeUid}:${vendorUid}`, JSON.stringify(keys));
    } catch {
      /* ignore */
    }
  }, [storeUid, vendorUid, selectedOrderKeys, orderCatalogKeys]);

  const loadProducts = useCallback(async () => {
    if (!storeUid || !vendorUid) return;
    setLoading(true);
    setError(null);
    try {
      const selectedVendor = Number(vendorUid);
      let nextPage = 1;
      let totalCount = 0;
      const collected: Record<string, unknown>[] = [];
      do {
        const data = await fetchStoreProducts(Number(storeUid), nextPage, PRODUCT_FETCH_SIZE);
        totalCount = data.totalCount ?? 0;
        const filtered = (data.contents ?? [])
          .filter((p) => getAssignedVendorUid(p) === selectedVendor)
          .map(toProductRow);
        collected.push(...filtered);
        nextPage += 1;
      } while ((nextPage - 1) * PRODUCT_FETCH_SIZE < totalCount);
      setAllRows(collected);
      setTotalElements(collected.length);
      setTotalPages(Math.max(1, Math.ceil(collected.length / PAGE_SIZE)));
      setRows(collected.slice(0, PAGE_SIZE));
    } catch (e) {
      setAllRows([]);
      setRows([]);
      setTotalElements(0);
      setTotalPages(0);
      setError(e instanceof Error ? e.message : '조회 실패');
    } finally {
      setLoading(false);
    }
  }, [storeUid, vendorUid]);

  useEffect(() => {
    if (!storeUid || !vendorUid) return;
    void loadProducts();
  }, [storeUid, vendorUid, loadProducts]);

  useEffect(() => {
    const from = page * PAGE_SIZE;
    setRows(allRows.slice(from, from + PAGE_SIZE));
  }, [allRows, page]);

  const toggleOrderKey = useCallback((key: string) => {
    setSelectedOrderKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next.size === 0 ? prev : next;
    });
  }, []);

  const saveOrderColumns = useCallback(async () => {
    if (!targetForm) return;
    const keys = orderCatalogKeys.filter((k) => selectedOrderKeys.has(k));
    if (keys.length === 0) {
      alert('주문 칼럼을 한 개 이상 선택하세요.');
      return;
    }
    setSavingPreset(true);
    try {
      const next = await updateVendorOrderForm(targetForm.vendorUid, targetForm.formUid, {
        formName: targetForm.formName,
        active: targetForm.active,
        columnKeys: targetForm.columnKeys ?? [],
        purchaseColumnKeys: keys,
      });
      setTargetForm(next);
      alert('발주서 주문 칼럼이 저장되었습니다.');
    } catch (e) {
      alert(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setSavingPreset(false);
    }
  }, [targetForm, orderCatalogKeys, selectedOrderKeys]);

  const vendorLabel = vendors.find((v) => String(v.vendorId) === vendorUid)?.vendorName ?? '';
  const start = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const end = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <section className="settings-section">
      <h2>{previewMode ? '발주서 미리보기' : '발주서 내용 만들기'}</h2>
      <p className="page-desc" style={{ marginTop: 8 }}>
        {selectedFormName ? (
          <>
            현재 선택된 발주서: <strong>{selectedFormName}</strong>
            <br />
          </>
        ) : null}
        스토어 + 발주업체 조건으로 DB 상품목록을 불러옵니다.{' '}
        {isNaverStore ? '네이버 주문 API 칼럼을 선택해 발주서에 저장할 수 있습니다.' : '주문 칼럼 선택은 네이버 스토어에서 지원합니다.'}
      </p>

      <div className="settings-toolbar" style={{ flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {!previewMode ? (
          <>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>스토어</span>
              <select
                value={storeUid}
                onChange={(e) => {
                  setStoreUid(e.target.value);
                  setPage(0);
                }}
                style={{ minWidth: 200, padding: '6px 10px' }}
                disabled={storesLoading}
              >
                <option value="">선택</option>
                {myStores.filter((s) => s.enabled).map((s) => (
                  <option key={s.uid} value={String(s.uid)}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <span>발주업체</span>
              <select
                value={vendorUid}
                onChange={(e) => {
                  setVendorUid(e.target.value);
                  setPage(0);
                }}
                style={{ minWidth: 200, padding: '6px 10px' }}
              >
                <option value="">선택</option>
                {vendors.map((v) => (
                  <option key={v.vendorId} value={String(v.vendorId)}>
                    {v.vendorName}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : (
          <div style={{ display: 'inline-flex', gap: 16, alignItems: 'center', fontSize: '0.95rem' }}>
            <span>
              <strong>스토어:</strong>{' '}
              {myStores.find((s) => String(s.uid) === storeUid)?.name ?? '-'}
            </span>
            <span>
              <strong>발주업체:</strong>{' '}
              {vendors.find((v) => String(v.vendorId) === vendorUid)?.vendorName ?? '-'}
            </span>
          </div>
        )}
        <button type="button" className="btn btn-outline" disabled={loading || !storeUid || !vendorUid} onClick={() => void loadProducts()}>
          {loading ? '불러오는 중…' : '새로고침'}
        </button>
        {!previewMode && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={!targetForm || !isNaverStore || savingPreset}
            onClick={() => void saveOrderColumns()}
          >
            {savingPreset ? '저장 중…' : '발주서 내용 저장'}
          </button>
        )}
        <Link to="/product/list" className="btn-link" style={{ fontSize: '0.875rem' }}>
          상품에서 발주업체 지정
        </Link>
      </div>

      {error && <p style={{ color: '#c00', marginTop: 8 }}>{error}</p>}

      {!previewMode && isNaverStore && (
        <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <strong style={{ display: 'block', marginBottom: 8 }}>네이버 주문 API 칼럼 선택</strong>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {orderCatalogKeys.map((key) => (
              <label key={key} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={selectedOrderKeys.has(key)}
                  onChange={() => toggleOrderKey(key)}
                />
                <span>{getPurchaseExportLabel(key)}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {previewMode && isNaverStore && (
        <div style={{ marginTop: 12, border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <strong style={{ display: 'block', marginBottom: 8 }}>저장된 주문 칼럼</strong>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {orderCatalogKeys
              .filter((key) => selectedOrderKeys.has(key))
              .map((key) => (
                <span key={key} className="badge badge-active">
                  {getPurchaseExportLabel(key)}
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="settings-table-wrap vendor-orders-grid-wrap" style={{ marginTop: 12 }}>
        <table className="settings-table vendor-orders-grid">
          <thead>
            <tr>
              {productKeys.map((key) => (
                <th key={key} className="vendor-orders-col-head">{key}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!storeUid || !vendorUid ? (
              <tr>
                <td colSpan={Math.max(1, productKeys.length)} style={{ padding: 24, textAlign: 'center' }}>
                  {previewMode
                    ? '저장된 미리보기 대상(스토어/발주업체) 정보가 없습니다. 먼저 "내용 만들기"에서 저장 후 다시 미리보기를 열어주세요.'
                    : '스토어와 발주업체를 선택하세요.'}
                </td>
              </tr>
            ) : loading && rows.length === 0 ? (
              <tr><td colSpan={Math.max(1, productKeys.length)} style={{ padding: 24, textAlign: 'center' }}>불러오는 중…</td></tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={Math.max(1, productKeys.length)} style={{ padding: 24, textAlign: 'center' }}>
                  해당 조건의 상품이 없습니다. 이 스토어 상품에 {vendorLabel ? `「${vendorLabel}」` : '선택한 발주업체'}가 지정돼 있는지 확인하세요.
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={`${page}-${idx}`}>
                  {productKeys.map((key) => (
                    <td key={key} style={{ fontSize: '0.85rem', verticalAlign: 'top' }}>
                      {String(r[key] ?? '-')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalElements > 0 && (
        <div className="product-list-pagination" style={{ marginTop: 12 }}>
          <span className="product-list-pagination-info">
            전체 {totalElements.toLocaleString()}건 중 {start}–{end}건
          </span>
          <div className="product-list-pagination-btns">
            <button type="button" className="btn btn-outline product-list-page-btn" disabled={page <= 0 || loading} onClick={() => setPage(0)}>«</button>
            <button type="button" className="btn btn-outline product-list-page-btn" disabled={page <= 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}>‹</button>
            <span style={{ padding: '0 8px', fontSize: '0.9rem' }}>{page + 1} / {Math.max(1, totalPages)}</span>
            <button type="button" className="btn btn-outline product-list-page-btn" disabled={page >= totalPages - 1 || loading || totalPages === 0} onClick={() => setPage((p) => p + 1)}>›</button>
            <button type="button" className="btn btn-outline product-list-page-btn" disabled={page >= totalPages - 1 || loading || totalPages === 0} onClick={() => setPage(Math.max(0, totalPages - 1))}>»</button>
          </div>
        </div>
      )}
    </section>
  );
}
