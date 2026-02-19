'use client';

import { useMemo } from 'react';
import { getMergedSystemColumns } from '@/utils/autoMapping';
import '@/styles/Settings.css';

const PREVIEW_ROWS = [
  {
    orderNo: 'PO-2024-001',
    orderDate: '2024-02-06',
    productCode: 'P001',
    productName: '무선 이어폰 블랙',
    option: '블랙',
    qty: 100,
    unitPrice: 15000,
    supplyPrice: 12000,
    amount: 1500000,
    deliveryRequest: '2024-02-15',
    remark: '당일 발송 요청',
  },
  {
    orderNo: 'PO-2024-001',
    orderDate: '2024-02-06',
    productCode: 'P002',
    productName: 'USB-C 케이블',
    option: '-',
    qty: 200,
    unitPrice: 5000,
    supplyPrice: 4000,
    amount: 1000000,
    deliveryRequest: '2024-02-15',
    remark: '',
  },
];

export default function OrderTemplatePreviewModal({
  formName,
  supplierName,
  columnKeys = [],
  onClose,
}) {
  const columnMap = useMemo(() => {
    const merged = getMergedSystemColumns();
    return Object.fromEntries(merged.map((c) => [c.key, { ...c, width: 120 }]));
  }, []);

  const orderedColumns = useMemo(
    () => columnKeys.map((k) => columnMap[k]).filter(Boolean),
    [columnKeys]
  );

  const title = formName || supplierName ? `발주서 미리보기 - ${formName || supplierName}` : '발주서 미리보기';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg modal-xl" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="modal-desc">해당 양식 순서대로 엑셀 발주서가 생성됩니다.</p>

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
              {PREVIEW_ROWS.map((row, i) => (
                <tr key={i}>
                  <td className="preview-td-no">{i + 1}</td>
                  {orderedColumns.map((col) => (
                    <td key={col.key}>{row[col.key] ?? '-'}</td>
                  ))}
                </tr>
              ))}
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
