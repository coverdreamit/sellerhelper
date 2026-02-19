'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from '@/components/Link';
import OrderTemplateUploadModal from '@/components/order-template/OrderTemplateUploadModal';
import OrderTemplateEditModal from '@/components/order-template/OrderTemplateEditModal';
import OrderTemplatePreviewModal from '@/components/order-template/OrderTemplatePreviewModal';
import AutoMappingSettingModal from '@/components/order-template/AutoMappingSettingModal';
import '../../../styles/Settings.css';
import './SupplierFormManage.css';

// 엑셀 양식에 넣을 수 있는 컬럼 후보
const AVAILABLE_COLUMNS = [
  { key: 'orderNo', label: '발주번호', width: 120 },
  { key: 'orderDate', label: '발주일', width: 100 },
  { key: 'productCode', label: '상품코드', width: 100 },
  { key: 'productName', label: '상품명', width: 200 },
  { key: 'option', label: '옵션', width: 120 },
  { key: 'qty', label: '수량', width: 80 },
  { key: 'unitPrice', label: '단가', width: 100 },
  { key: 'supplyPrice', label: '공급가', width: 100 },
  { key: 'amount', label: '금액', width: 100 },
  { key: 'deliveryRequest', label: '납기요청일', width: 100 },
  { key: 'remark', label: '비고', width: 150 },
];

const STORAGE_KEY_PREFIX = 'supplierForm_';
const DEFAULT_COLUMN_KEYS = [
  'orderNo',
  'orderDate',
  'productCode',
  'productName',
  'qty',
  'unitPrice',
  'amount',
  'remark',
];

const INITIAL_MOCK_FORMS = [
  {
    id: 1,
    name: '기본 발주 양식',
    supplierId: '1',
    supplier: '(주)공급업체A',
    columns: [
      'orderNo',
      'orderDate',
      'productCode',
      'productName',
      'qty',
      'unitPrice',
      'amount',
      'remark',
    ],
    useYn: 'Y',
    updated: '2024-02-05',
  },
  {
    id: 2,
    name: 'B도매 발주서',
    supplierId: '2',
    supplier: 'B도매센터',
    columns: [
      'orderNo',
      'productCode',
      'productName',
      'option',
      'qty',
      'supplyPrice',
      'deliveryRequest',
    ],
    useYn: 'Y',
    updated: '2024-02-04',
  },
];

const columnMap = Object.fromEntries(AVAILABLE_COLUMNS.map((c) => [c.key, c]));

function loadFormFromStorage(supplierId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + supplierId);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (Array.isArray(data.columnKeys) && data.columnKeys.length) return data.columnKeys;
    // 이전 React Flow 형식 호환
    if (Array.isArray(data.nodes) && data.nodes.length) {
      const sorted = [...data.nodes].sort((a, b) => (a.position?.y ?? 0) - (b.position?.y ?? 0));
      return sorted.map((n) => n.data?.key).filter(Boolean);
    }
  } catch (_) {}
  return null;
}

function saveFormToStorage(supplierId, columnKeys) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + supplierId, JSON.stringify({ columnKeys }));
  } catch (_) {}
}

// 목록에서 넘어올 때 vendorId(501,502) → mock supplierId('1','2') 매핑
const VENDOR_ID_TO_SUPPLIER_ID = { 501: '1', 502: '2' };

export default function SupplierFormManage({ vendorId: initialVendorId }) {
  const resolvedInitial = initialVendorId
    ? (VENDOR_ID_TO_SUPPLIER_ID[Number(initialVendorId)] ?? String(initialVendorId))
    : '1';
  const [selectedSupplier, setSelectedSupplier] = useState(resolvedInitial);
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_COLUMN_KEYS);
  const [showUpload, setShowUpload] = useState(false);
  const [showAutoMappingSetting, setShowAutoMappingSetting] = useState(false);
  const [editModalForm, setEditModalForm] = useState(null);
  const [previewModalForm, setPreviewModalForm] = useState(null);
  const [formCards, setFormCards] = useState(INITIAL_MOCK_FORMS);

  useEffect(() => {
    if (initialVendorId) {
      const mapped = VENDOR_ID_TO_SUPPLIER_ID[Number(initialVendorId)] ?? String(initialVendorId);
      setSelectedSupplier(mapped);
    }
  }, [initialVendorId]);

  useEffect(() => {
    const saved = loadFormFromStorage(selectedSupplier);
    setSelectedColumns(saved && saved.length ? saved : DEFAULT_COLUMN_KEYS);
  }, [selectedSupplier]);

  const handleUploadSave = useCallback((supplierId, columnKeys) => {
    setSelectedSupplier(supplierId);
    setSelectedColumns(columnKeys.length ? columnKeys : DEFAULT_COLUMN_KEYS);
    saveFormToStorage(supplierId, columnKeys);
    setFormCards((prev) => {
      const existing = prev.find((f) => f.supplierId === supplierId);
      const name = existing?.name ?? '업로드 양식';
      const updated = new Date().toISOString().slice(0, 10);
      if (existing) {
        return prev.map((f) =>
          f.supplierId === supplierId ? { ...f, columns: columnKeys, updated } : f
        );
      }
      const supplier = supplierId === '1' ? '(주)공급업체A' : 'B도매센터';
      return [
        ...prev,
        { id: Date.now(), name, supplierId, supplier, columns: columnKeys, useYn: 'Y', updated },
      ];
    });
    setShowUpload(false);
  }, []);

  const handleEditSave = useCallback((supplierId, columnKeys) => {
    saveFormToStorage(supplierId, columnKeys);
    setFormCards((prev) =>
      prev.map((f) =>
        f.supplierId === supplierId
          ? { ...f, columns: [...columnKeys], updated: new Date().toISOString().slice(0, 10) }
          : f
      )
    );
    setSelectedSupplier(supplierId);
    setSelectedColumns(columnKeys);
    setEditModalForm(null);
    alert('해당 업체 양식이 저장되었습니다.');
  }, []);

  return (
    <div className="settings-page supplier-form-page">
      <h1>발주양식 관리</h1>
      <p className="page-desc">
        발주업체별 엑셀 발주 양식을 설정합니다. 항목을 넣고·빼고·드래그로 순서를 바꾼 뒤 업체별로
        저장할 수 있습니다.
      </p>

      <section className="settings-section">
        <h2>발주양식 목록</h2>
        <div className="settings-toolbar">
          <div>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 발주업체</option>
              <option value="1">(주)공급업체A</option>
              <option value="2">B도매센터</option>
            </select>
            <input
              type="text"
              placeholder="양식명 검색"
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <button type="button" className="btn">
              검색
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={() => setShowAutoMappingSetting(true)}>
              자동매핑 설정
            </button>
            <Link to="/settings/supplier/list" className="btn">
              발주업체 목록
            </Link>
            <button type="button" className="btn btn-primary" onClick={() => setShowUpload(true)}>
              발주양식 업로드
            </button>
          </div>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>양식명</th>
                <th>적용 발주업체</th>
                <th>사용여부</th>
                <th>수정일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {formCards.map((f) => (
                <tr key={f.id}>
                  <td>{f.name}</td>
                  <td>{f.supplier}</td>
                  <td>
                    <span className={`badge badge-${f.useYn === 'Y' ? 'active' : 'inactive'}`}>
                      {f.useYn === 'Y' ? '사용' : '미사용'}
                    </span>
                  </td>
                  <td>{f.updated}</td>
                  <td className="cell-actions">
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() =>
                        setPreviewModalForm({
                          formName: f.name,
                          supplierName: f.supplier,
                          columnKeys: f.columns?.length
                            ? f.columns
                            : loadFormFromStorage(f.supplierId) || DEFAULT_COLUMN_KEYS,
                        })
                      }
                    >
                      미리보기
                    </button>
                    <button
                      type="button"
                      className="btn-link"
                      onClick={() =>
                        setEditModalForm({
                          supplierId: f.supplierId,
                          supplierName: f.supplier,
                          initialColumnKeys: f.columns?.length
                            ? f.columns
                            : loadFormFromStorage(f.supplierId) || DEFAULT_COLUMN_KEYS,
                        })
                      }
                    >
                      편집
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showUpload && (
        <OrderTemplateUploadModal
          onClose={() => setShowUpload(false)}
          onSave={handleUploadSave}
          supplierId={selectedSupplier}
        />
      )}

      {editModalForm && (
        <OrderTemplateEditModal
          supplierId={editModalForm.supplierId}
          supplierName={editModalForm.supplierName}
          initialColumnKeys={editModalForm.initialColumnKeys}
          onClose={() => setEditModalForm(null)}
          onSave={handleEditSave}
        />
      )}

      {previewModalForm && (
        <OrderTemplatePreviewModal
          formName={previewModalForm.formName}
          supplierName={previewModalForm.supplierName}
          columnKeys={previewModalForm.columnKeys}
          onClose={() => setPreviewModalForm(null)}
        />
      )}

      {showAutoMappingSetting && (
        <AutoMappingSettingModal onClose={() => setShowAutoMappingSetting(false)} />
      )}
    </div>
  );
}
