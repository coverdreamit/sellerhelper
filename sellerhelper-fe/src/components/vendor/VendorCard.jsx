'use client';

import Link from '@/components/Link';
import '@/styles/Settings.css';

export function VendorCard({ vendor, onEdit, onPolicy, onTemplate }) {
  const orderMethodLabel = vendor.orderMethod === 'EMAIL' ? '이메일' : vendor.orderMethod === 'EXCEL' ? '엑셀' : vendor.orderMethod ?? '-';
  const shippingLabel = vendor.shippingType === 'DIRECT' ? '직배송' : vendor.shippingType === 'CONSIGNMENT' ? '위탁' : vendor.shippingType ?? '-';

  return (
    <div
      className="vendor-card settings-section"
      style={{
        marginBottom: 16,
        opacity: vendor.isActive ? 1 : 0.85,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem' }}>{vendor.vendorName}</h3>
          <p className="vendor-card-meta" style={{ margin: '0 0 4px 0', fontSize: '0.9rem', color: '#555' }}>
            담당자: {vendor.managerName ?? '-'}
          </p>
          <p className="vendor-card-meta" style={{ margin: 0, fontSize: '0.9rem', color: '#555' }}>
            연락처: {vendor.phone ?? '-'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            <span className={`badge ${vendor.isActive ? 'badge-active' : 'badge-inactive'}`}>
              {vendor.isActive ? '사용중' : '사용중지'}
            </span>
            <span className="badge badge-active">{orderMethodLabel}</span>
            <span className="badge badge-active">{shippingLabel}</span>
          </div>
        </div>
        <div className="vendor-card-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {onEdit ? (
            <button type="button" className="btn" onClick={() => onEdit(vendor)}>
              기본정보 수정
            </button>
          ) : (
            <Link to={`/settings/supplier/edit?vendorId=${vendor.vendorId}`} className="btn">
              기본정보 수정
            </Link>
          )}
          <button type="button" className="btn" onClick={() => onPolicy?.(vendor)}>
            ⚙ 발주정책
          </button>
        </div>
      </div>
    </div>
  );
}
