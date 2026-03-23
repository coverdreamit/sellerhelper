'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from '@/components/Link';
import VendorOrdersPanel from '@/views/settings/supplier/VendorOrdersPanel';
import '../../../styles/Settings.css';
import './SupplierFormManage.css';

export default function VendorOrderContentPage() {
  const searchParams = useSearchParams();
  const formName = searchParams.get('formName');
  const vendorUidRaw = searchParams.get('vendorUid');
  const formUidRaw = searchParams.get('formUid');
  const previewRaw = searchParams.get('preview');

  const defaultVendorUid = useMemo(() => {
    if (!vendorUidRaw) return null;
    const n = Number(vendorUidRaw);
    return Number.isFinite(n) ? n : null;
  }, [vendorUidRaw]);

  const formUid = useMemo(() => {
    if (!formUidRaw) return null;
    const n = Number(formUidRaw);
    return Number.isFinite(n) ? n : null;
  }, [formUidRaw]);

  const previewMode = useMemo(() => previewRaw === '1', [previewRaw]);

  return (
    <div className="settings-page supplier-form-page">
      <div className="settings-toolbar" style={{ marginBottom: 12 }}>
        <h1 style={{ margin: 0 }}>발주서 내용 만들기</h1>
        <Link to="/settings/supplier/forms" className="btn btn-outline">
          발주서 목록으로
        </Link>
      </div>
      <VendorOrdersPanel
        selectedFormName={formName}
        defaultVendorUid={defaultVendorUid}
        formUid={formUid}
        previewMode={previewMode}
      />
    </div>
  );
}
