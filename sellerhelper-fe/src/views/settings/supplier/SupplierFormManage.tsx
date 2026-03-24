'use client';
import { useState, useCallback, useMemo, useEffect } from 'react';
import Link from '@/components/Link';
import OrderTemplateEditModal from '@/components/order-template/OrderTemplateEditModal';
import OrderTemplatePreviewModal from '@/components/order-template/OrderTemplatePreviewModal';
import { useVendorStore } from '@/stores';
import {
  loadSupplierPoColumnKeys,
  saveSupplierPoColumnKeys,
} from '@/utils/supplierPoFormStorage';
import '../../../styles/Settings.css';
import './SupplierFormManage.css';

type SupplierFormManageProps = {
  vendorId?: string | number | null;
};

export default function SupplierFormManage({ vendorId: initialVendorId }: SupplierFormManageProps) {
  const { vendors, loading, error, loadVendors } = useVendorStore();
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [editModalForm, setEditModalForm] = useState<{
    supplierId: string;
    supplierName: string;
    initialColumnKeys: string[];
  } | null>(null);
  const [previewModalForm, setPreviewModalForm] = useState<{
    formName: string;
    supplierName: string;
    columnKeys: string[];
  } | null>(null);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  useEffect(() => {
    if (vendors.length === 0) return;
    const first =
      initialVendorId != null && initialVendorId !== ''
        ? String(initialVendorId)
        : String(vendors[0].vendorId);
    setSelectedSupplier((prev) => (prev ? prev : first));
  }, [vendors, initialVendorId]);

  useEffect(() => {
    if (initialVendorId != null && initialVendorId !== '') {
      setSelectedSupplier(String(initialVendorId));
    }
  }, [initialVendorId]);

  const filteredVendors = useMemo(() => {
    const q = searchName.trim().toLowerCase();
    if (!q) return vendors;
    return vendors.filter((v) => v.vendorName.toLowerCase().includes(q));
  }, [vendors, searchName]);

  const handleEditSave = useCallback((supplierId: string, columnKeys: string[]) => {
    saveSupplierPoColumnKeys(supplierId, columnKeys);
    setEditModalForm(null);
    alert('해당 업체 발주 양식이 저장되었습니다.');
  }, []);

  return (
    <div className="settings-page supplier-form-page">
      <h1>발주양식 관리</h1>
      <p className="page-desc">
        발주업체별로 엑셀 발주서에 포함할 스토어·주문·상품·배송 컬럼을 선택합니다. 네이버 스마트스토어에서
        내려받은 주문/발송 엑셀과 동일한 의미의 필드입니다. 배송 목록에서 주문을 선택·발주서 생성 시 이
        순서대로 출력됩니다.
      </p>

      <section className="settings-section">
        <h2>발주업체별 컬럼 설정</h2>
        <div className="settings-toolbar">
          <div>
            <select
              style={{ padding: '6px 12px', marginRight: 8 }}
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              aria-label="발주업체 필터"
            >
              {vendors.length === 0 ? (
                <option value="">등록된 발주업체 없음</option>
              ) : (
                vendors.map((v) => (
                  <option key={v.vendorId} value={String(v.vendorId)}>
                    {v.vendorName}
                  </option>
                ))
              )}
            </select>
            <input
              type="text"
              placeholder="업체명 검색"
              style={{ padding: '6px 12px', marginRight: 8 }}
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
            />
            <button type="button" className="btn">
              검색
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link to="/settings/supplier/list" className="btn">
              발주업체 목록
            </Link>
            <button
              type="button"
              className="btn btn-primary"
              disabled={!selectedSupplier}
              onClick={() => {
                const v = vendors.find((x) => String(x.vendorId) === selectedSupplier);
                if (!v) return;
                setEditModalForm({
                  supplierId: String(v.vendorId),
                  supplierName: v.vendorName,
                  initialColumnKeys: loadSupplierPoColumnKeys(String(v.vendorId)),
                });
              }}
            >
              선택 업체 컬럼 편집
            </button>
          </div>
        </div>

        {error && (
          <p style={{ color: '#c00', padding: '8px 0', margin: 0 }}>{error}</p>
        )}
        {loading && <p className="page-desc">목록 불러오는 중…</p>}

        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>발주업체</th>
                <th>사용여부</th>
                <th>수정일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 && !loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: 24, textAlign: 'center' }}>
                    발주업체가 없습니다. 발주업체 목록에서 등록하세요.
                  </td>
                </tr>
              ) : (
                filteredVendors.map((v) => {
                  const cols = loadSupplierPoColumnKeys(String(v.vendorId));
                  return (
                    <tr key={v.vendorId}>
                      <td>{v.vendorName}</td>
                      <td>
                        <span
                          className={`badge badge-${v.isActive ? 'active' : 'inactive'}`}
                        >
                          {v.isActive ? '사용' : '미사용'}
                        </span>
                      </td>
                      <td>{v.updatedAt ? v.updatedAt.slice(0, 10) : '-'}</td>
                      <td className="cell-actions">
                        <button
                          type="button"
                          className="btn-link"
                          onClick={() =>
                            setPreviewModalForm({
                              formName: `${v.vendorName} 발주서`,
                              supplierName: v.vendorName,
                              columnKeys: cols,
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
                              supplierId: String(v.vendorId),
                              supplierName: v.vendorName,
                              initialColumnKeys: cols,
                            })
                          }
                        >
                          컬럼 편집
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

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
    </div>
  );
}
