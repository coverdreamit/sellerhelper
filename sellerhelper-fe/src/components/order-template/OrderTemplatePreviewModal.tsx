'use client';

import { useMemo } from 'react';
import { getOrderTemplateFieldMap } from '@/constants/orderTemplateFields';
import '@/styles/Settings.css';

const PREVIEW_ROWS = [
  {
    mallOrderNo: '20240324-00012345',
    productOrderNo: '20240324-00012345-01',
    orderDate: '2024-03-24 10:30:00',
    orderStatus: 'PAYED',
    storeName: '내 스마트스토어',
    buyerName: '홍길동',
    buyerPhone: '010-1234-5678',
    receiverName: '김수령',
    receiverPhone: '010-9876-5432',
    receiverAddress: '서울시 강남구 테헤란로 123',
    productName: '샘플 상품 A',
    optionInfo: '블랙 / L',
    quantity: 2,
    unitPrice: 15000,
    totalPrice: 30000,
    productOrderStatus: 'PAYED',
    supplyPrice: '',
    remark: '',
  },
  {
    mallOrderNo: '20240324-00012345',
    productOrderNo: '20240324-00012345-02',
    orderDate: '2024-03-24 10:30:00',
    orderStatus: 'PAYED',
    storeName: '내 스마트스토어',
    buyerName: '홍길동',
    buyerPhone: '010-1234-5678',
    receiverName: '김수령',
    receiverPhone: '010-9876-5432',
    receiverAddress: '서울시 강남구 테헤란로 123',
    productName: '샘플 상품 B',
    optionInfo: '-',
    quantity: 1,
    unitPrice: 8000,
    totalPrice: 8000,
    productOrderStatus: 'PAYED',
    supplyPrice: '',
    remark: '당일 출고',
  },
];

export default function OrderTemplatePreviewModal({
  formName,
  supplierName,
  columnKeys = [],
  onClose,
}) {
  const columnMap = useMemo(() => getOrderTemplateFieldMap(), []);

  const orderedColumns = useMemo(
    () => columnKeys.map((k) => columnMap[k]).filter(Boolean),
    [columnKeys, columnMap]
  );

  const title = formName || supplierName ? `발주서 미리보기 - ${formName || supplierName}` : '발주서 미리보기';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg modal-xl" onClick={(e) => e.stopPropagation()}>
        <h2>{title}</h2>
        <p className="modal-desc">선택한 컬럼 순서대로 엑셀 발주서가 생성됩니다.</p>

        <div className="preview-table-wrap" style={{ maxHeight: '60vh', overflow: 'auto' }}>
          <table className="settings-table">
            <thead>
              <tr>
                {orderedColumns.map((col) => (
                  <th key={col.key} style={{ minWidth: col.width }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PREVIEW_ROWS.map((row, idx) => (
                <tr key={idx}>
                  {orderedColumns.map((col) => (
                    <td key={col.key}>{row[col.key] ?? ''}</td>
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
