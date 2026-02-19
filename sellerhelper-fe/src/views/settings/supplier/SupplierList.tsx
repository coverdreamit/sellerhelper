'use client';

import { useState } from 'react';
import { useVendorStore } from '@/stores';
import Link from '@/components/Link';
import { VendorCard } from '@/components/vendor/VendorCard';
import { SupplierPolicyModal } from '@/components/vendor/SupplierPolicyModal';
import { SupplierEditModal } from '@/components/vendor/SupplierEditModal';
import '../../../styles/Settings.css';

export default function SupplierList() {
  const { vendors, loading, error } = useVendorStore();
  const [policyVendor, setPolicyVendor] = useState(null);
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
      <p className="page-desc">발주업체 등록, 수정, 삭제, 발주정책 설정을 관리합니다.</p>

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
              onPolicy={() => setPolicyVendor(vendor)}
              onTemplate={() => {}}
            />
          ))}
        </div>
      </section>

      {showEditModal && (
        <SupplierEditModal
          vendor={editVendor}
          onClose={closeEditModal}
          onSave={(data) => {
            // TODO: API 연동 시 저장 처리
            console.log('발주업체 저장', data);
            closeEditModal();
          }}
        />
      )}

      {policyVendor && (
        <SupplierPolicyModal
          vendor={policyVendor}
          onClose={() => setPolicyVendor(null)}
          onSave={(vendorId, policy) => {
            // TODO: API 연동 시 저장 처리
            console.log('발주정책 저장', vendorId, policy);
            setPolicyVendor(null);
          }}
        />
      )}
    </div>
  );
}
