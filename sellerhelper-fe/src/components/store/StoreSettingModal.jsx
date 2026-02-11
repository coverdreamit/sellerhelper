'use client';

import StoreSettingContainer from './StoreSettingContainer';

export default function StoreSettingModal({ storeCode, onClose }) {
  if (!storeCode) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} role="dialog">
        <StoreSettingContainer storeCode={storeCode} />

        <div className="modal-actions">
          <button type="button" className="btn btn-primary">
            저장
          </button>
          <button type="button" className="btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
