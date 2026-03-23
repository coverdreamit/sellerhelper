'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from '@/components/Link';
import VendorOrderFormModal from '@/components/vendor/VendorOrderFormModal';
import { useVendorStore } from '@/stores';
import {
  fetchAllVendorOrderForms,
  deleteVendorOrderForm,
  type VendorOrderFormDto,
} from '@/services/vendorOrderForm.service';
import '../../../styles/Settings.css';
import './SupplierFormManage.css';

function formatUpdatedAt(iso: string | undefined): string {
  if (!iso) return '-';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('ko-KR');
  } catch {
    return iso.slice(0, 10);
  }
}

function buildContentHref(f: VendorOrderFormDto): string {
  const q = new URLSearchParams();
  q.set('formUid', String(f.formUid));
  q.set('vendorUid', String(f.vendorUid));
  q.set('formName', f.formName);
  return `/settings/supplier/forms/content?${q.toString()}`;
}

function buildPreviewHref(f: VendorOrderFormDto): string {
  const q = new URLSearchParams();
  q.set('formUid', String(f.formUid));
  q.set('vendorUid', String(f.vendorUid));
  q.set('formName', f.formName);
  q.set('preview', '1');
  return `/settings/supplier/forms/content?${q.toString()}`;
}

export default function SupplierFormManage() {
  const { vendors, loadVendors } = useVendorStore();
  const [forms, setForms] = useState<VendorOrderFormDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formModal, setFormModal] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    editTarget: VendorOrderFormDto | null;
  }>({ open: false, mode: 'create', editTarget: null });

  const refreshForms = useCallback(async () => {
    const list = await fetchAllVendorOrderForms();
    setForms(list);
  }, []);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        await refreshForms();
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : '발주 양식을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshForms]);

  const handleDelete = useCallback(
    async (f: VendorOrderFormDto) => {
      if (!window.confirm(`「${f.formName}」 발주서를 삭제할까요?`)) return;
      try {
        await deleteVendorOrderForm(f.vendorUid, f.formUid);
        await refreshForms();
      } catch (e) {
        alert(e instanceof Error ? e.message : '삭제 실패');
      }
    },
    [refreshForms]
  );

  return (
    <div className="settings-page supplier-form-page">
      <h1>발주양식 관리</h1>
      <p className="page-desc">
        발주서 목록에서 먼저 발주서를 등록하고, 각 발주서의 <strong>내용 만들기</strong>에서 API 그리드를
        불러와 칼럼 체크 후 CSV를 만듭니다.
      </p>

      <section className="settings-section">
        <h2>발주서 목록</h2>
        <div className="settings-toolbar">
          <div />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                setFormModal({ open: true, mode: 'create', editTarget: null })
              }
            >
              발주서 등록
            </button>
            <Link to="/settings/supplier/list" className="btn">
              발주업체 목록
            </Link>
          </div>
        </div>

        {error && <p style={{ color: '#c00', marginTop: 8 }}>{error}</p>}

        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>발주서 이름</th>
                <th>발주업체</th>
                <th>사용여부</th>
                <th>수정일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center' }}>
                    불러오는 중…
                  </td>
                </tr>
              ) : forms.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 24, textAlign: 'center' }}>
                    등록된 발주서가 없습니다. &quot;발주서 등록&quot;을 먼저 해주세요.
                  </td>
                </tr>
              ) : (
                forms.map((f) => (
                  <tr key={f.formUid}>
                    <td>{f.formName}</td>
                    <td>{f.vendorName}</td>
                    <td>
                      <span className={`badge badge-${f.active ? 'active' : 'inactive'}`}>
                        {f.active ? '사용' : '미사용'}
                      </span>
                    </td>
                    <td>{formatUpdatedAt(f.updatedAt)}</td>
                    <td className="cell-actions">
                      <Link to={buildContentHref(f)} className="btn-link">
                        내용 만들기
                      </Link>
                      <Link to={buildPreviewHref(f)} className="btn-link">
                        미리보기
                      </Link>
                      <button
                        type="button"
                        className="btn-link"
                        onClick={() =>
                          setFormModal({ open: true, mode: 'edit', editTarget: f })
                        }
                      >
                        수정
                      </button>
                      <button type="button" className="btn-link" onClick={() => handleDelete(f)}>
                        삭제
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <VendorOrderFormModal
        open={formModal.open}
        mode={formModal.mode}
        vendors={vendors}
        editTarget={formModal.editTarget}
        onClose={() => setFormModal((s) => ({ ...s, open: false }))}
        onSaved={refreshForms}
      />
    </div>
  );
}
