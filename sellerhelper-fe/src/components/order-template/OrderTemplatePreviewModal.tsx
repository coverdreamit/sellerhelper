'use client';

import { useEffect, useMemo, useState } from 'react';
import { ORDER_EXPORT_COLUMNS } from '@/constants/orderExportFields';
import type { OrderListItem } from '@/services/order.service';
import { fetchOrderList } from '@/services/order.service';
import { fetchMyStores, type MyStoreItem } from '@/services/myStore.service';
import { getOrderFieldString } from '@/utils/orderExportCsv';
import '@/styles/Settings.css';

export default function OrderTemplatePreviewModal({
  formName,
  supplierName,
  columnKeys = [],
  onClose,
}) {
  const [stores, setStores] = useState<MyStoreItem[]>([]);
  const [storeUid, setStoreUid] = useState<number | null>(null);
  const [rows, setRows] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const columnMap = useMemo(
    () => Object.fromEntries(ORDER_EXPORT_COLUMNS.map((c) => [c.key, c])),
    []
  );

  const orderedColumns = useMemo(
    () => columnKeys.map((k) => columnMap[k]).filter(Boolean),
    [columnKeys, columnMap]
  );

  const title = formName || supplierName ? `내보내기 미리보기 - ${formName || supplierName}` : '내보내기 미리보기';

  useEffect(() => {
    let cancelled = false;
    void fetchMyStores()
      .then((list) => {
        if (cancelled) return;
        const enabled = list.filter((s) => s.enabled);
        setStores(enabled);
        setStoreUid(enabled[0]?.uid ?? null);
      })
      .catch((e) => {
        if (cancelled) return;
        setStores([]);
        setStoreUid(null);
        setError(e instanceof Error ? e.message : '스토어 목록 조회 실패');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storeUid) {
      setRows([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchOrderList(storeUid, 0, 20)
      .then((page) => {
        if (!cancelled) setRows(page.content ?? []);
      })
      .catch((e) => {
        if (!cancelled) {
          setRows([]);
          setError(e instanceof Error ? e.message : '주문 목록 조회 실패');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [storeUid]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg modal-xl" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="modal-desc">선택한 순서대로 CSV에 컬럼이 붙습니다. (실제 주문 목록 데이터 기준)</p>

        <div className="settings-toolbar" style={{ marginBottom: 8 }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <span>스토어</span>
            <select
              value={storeUid == null ? '' : String(storeUid)}
              onChange={(e) => setStoreUid(e.target.value ? Number(e.target.value) : null)}
              style={{ minWidth: 220, padding: '6px 10px' }}
            >
              <option value="">선택</option>
              {stores.map((s) => (
                <option key={s.uid} value={s.uid}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <span style={{ color: '#666', fontSize: '0.85rem' }}>
            최신 20건 기준으로 미리보기합니다.
          </span>
        </div>

        {error && <p style={{ color: '#c00', margin: '8px 0' }}>{error}</p>}

        <div className="preview-table-wrap" style={{ maxHeight: '60vh', overflow: 'auto' }}>
          <table className="preview-table">
            <thead>
              <tr>
                <th className="preview-th-no">No</th>
                {orderedColumns.map((col) => (
                  <th key={col.key} style={{ minWidth: col.width }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={orderedColumns.length + 1} style={{ padding: 24, textAlign: 'center' }}>
                    불러오는 중…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={orderedColumns.length + 1} style={{ padding: 24, textAlign: 'center' }}>
                    조회된 주문이 없습니다.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={row.uid}>
                    <td className="preview-td-no">{i + 1}</td>
                    {orderedColumns.map((col) => (
                      <td key={col.key}>{getOrderFieldString(row, col.key) || '-'}</td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="settings-actions modal-actions">
          <button type="button" className="btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
