import '../../../styles/Settings.css';

export default function PolicySetting() {
  return (
    <div className="settings-page">
      <h1>기본 정책 설정</h1>
      <p className="page-desc">교환·반품, 배송 등 기본 정책을 설정합니다.</p>

      <section className="settings-section">
        <h2>교환·반품 정책</h2>
        <form className="settings-form">
          <div className="form-row">
            <label>교환·반품 가능 기간</label>
            <div>
              <input type="number" min="1" max="365" defaultValue="7" style={{ width: 80 }} /> 일
              <p className="form-hint">수령일 기준 교환·반품 신청 가능 기간</p>
            </div>
          </div>
          <div className="form-row">
            <label>반품 배송비 부담</label>
            <div>
              <select>
                <option value="seller">판매자 부담</option>
                <option value="buyer">구매자 부담</option>
                <option value="half">각 50%</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label>교환·반품 불가 사유</label>
            <div>
              <textarea placeholder="예: 고객 단순 변심, 개봉 후 사용한 상품 등" />
            </div>
          </div>
          <div className="settings-actions">
            <button type="button" className="btn btn-primary">
              저장
            </button>
          </div>
        </form>
      </section>

      <section className="settings-section">
        <h2>배송 정책</h2>
        <form className="settings-form">
          <div className="form-row">
            <label>기본 배송비</label>
            <div>
              <input type="number" min="0" defaultValue="3000" style={{ width: 100 }} /> 원
            </div>
          </div>
          <div className="form-row">
            <label>무료배송 기준 금액</label>
            <div>
              <input
                type="number"
                min="0"
                placeholder="0이면 무료배송 없음"
                defaultValue="50000"
                style={{ width: 120 }}
              />{' '}
              원
            </div>
          </div>
          <div className="form-row">
            <label>기본 배송 소요일</label>
            <div>
              <input type="number" min="1" max="30" defaultValue="3" style={{ width: 60 }} /> 일
              <p className="form-hint">결제 완료 후 출고까지 예상 소요일</p>
            </div>
          </div>
          <div className="settings-actions">
            <button type="button" className="btn btn-primary">
              저장
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
