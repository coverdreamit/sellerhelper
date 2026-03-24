'use client';

import { useState } from 'react';
import { useVendorStore } from '@/stores';
import Link from '@/components/Link';
import { VendorCard } from '@/components/vendor/VendorCard';
import { SupplierEditModal } from '@/components/vendor/SupplierEditModal';
import '../../../styles/Settings.css';

export default function SupplierList() {
  const { vendors, loading, error, saveVendor } = useVendorStore();
  const [showEditModal, setShowEditModal] = useState(false);
  const [editVendor, setEditVendor] = useState(null);

  const openNewModal = () => {
    setEditVendor(null);
    setShowEditModal(true);
  };
  const openEditModal = (vendor) => {
    setEditVendor(vendor);
    setShowEditModal(true);
  };
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditVendor(null);
  };

  if (loading) {
    return (
      <div className="settings-page">
        <h1>발주업체 목록</h1>
        <p className="page-desc">발주·입고 처리를 위한 업체 목록을 조회·관리합니다.</p>
        <p>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="settings-page">
        <h1>발주업체 목록</h1>
        <p className="page-desc" style={{ color: '#c00' }}>
          오류: {error}
        </p>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h1>발주업체 목록</h1>
      <p className="page-desc">발주업체 등록, 수정, 삭제를 관리합니다.</p>

      <section className="settings-section">
        <div className="settings-toolbar">
          <button type="button" className="btn btn-primary" onClick={openNewModal}>
            + 발주업체 등록
          </button>
          <Link to="/settings/supplier/forms" className="btn">
            📄 양식관리
          </Link>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {vendors.map((vendor) => (
            <VendorCard
              key={vendor.vendorId}
              vendor={vendor}
              onEdit={openEditModal}
            />
          ))}
        </div>
      </section>

      {showEditModal && (
        <SupplierEditModal
          vendor={editVendor}
          onClose={closeEditModal}
          onSave={async (data) => {
            try {
              await saveVendor(data);
              closeEditModal();
            } catch (e) {
              const message = e instanceof Error ? e.message : '발주업체 저장에 실패했습니다.';
              alert(message);
            }
          }}
        />
      )}

    </div>
  );
}
