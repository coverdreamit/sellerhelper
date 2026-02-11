'use client';

export default function StoreSettingContainer({ storeCode }) {
  return (
    <>
      <h2>스토어별 기본값</h2>
      <p className="modal-desc" style={{ marginBottom: 16 }}>
        {storeCode} 스토어에 적용할 기본 배송비·정책을 설정합니다.
      </p>
      <div className="settings-form">
        <div className="form-row">
          <label>기본 배송비 (원)</label>
          <input type="number" min={0} defaultValue={3000} style={{ width: 120 }} />
        </div>
        <div className="form-row">
          <label>무료배송 기준 (원)</label>
          <input
            type="number"
            min={0}
            placeholder="0이면 미적용"
            defaultValue={50000}
            style={{ width: 140 }}
          />
        </div>
        <div className="form-row">
          <label>기본 배송 소요일</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" min={1} max={30} defaultValue={3} style={{ width: 60 }} />
            <span>일</span>
          </div>
        </div>
        <div className="form-row">
          <label>주문 동기화 주기 (분)</label>
          <div>
            <input type="number" min={5} max={60} defaultValue={15} style={{ width: 60 }} />
            <p className="form-hint">해당 스토어 주문 조회 간격</p>
          </div>
        </div>
      </div>
    </>
  );
}
