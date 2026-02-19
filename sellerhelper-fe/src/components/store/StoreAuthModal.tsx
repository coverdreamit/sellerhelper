'use client';

export default function StoreAuthModal({ storeCode, onClose }) {
  if (!storeCode) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>스토어 API 설정</h2>
        <p className="modal-desc">
          {storeCode} 스토어 API 인증 정보를 입력하세요.
        </p>

        <div className="settings-form">
          <div className="form-row">
            <label>Client ID / API Key</label>
            <input type="text" placeholder="Client ID 또는 API Key" />
          </div>
          <div className="form-row">
            <label>Client Secret</label>
            <input type="password" placeholder="Client Secret 또는 Secret Key" />
          </div>
          <div className="form-row">
            <label>Seller Key</label>
            <input type="text" placeholder="스토어별 셀러 키 또는 샵 ID (해당 시)" />
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-primary">
            연결 테스트
          </button>
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
