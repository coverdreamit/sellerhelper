import Link from '@/components/Link';
import '../../../styles/Settings.css';

export default function StoreSetting() {
  return (
    <div className="settings-page">
      <h1>스토어별 기본 설정</h1>
      <p className="page-desc">스토어별로 적용할 기본 배송비, 정책 등을 설정합니다.</p>

      <section className="settings-section">
        <h2>스토어 선택</h2>
        <form className="settings-form">
          <div className="form-row">
            <label className="required">스토어</label>
            <div>
              <select>
                <option value="">선택</option>
                <option value="1">네이버 스마트스토어</option>
                <option value="2">쿠팡 로켓배송</option>
                <option value="3">11번가</option>
              </select>
            </div>
          </div>
        </form>
      </section>

      <section className="settings-section">
        <h2>해당 스토어 기본값</h2>
        <form className="settings-form">
          <div className="form-row">
            <label>기본 배송비 (원)</label>
            <div>
              <input type="number" min="0" defaultValue="3000" style={{ width: 100 }} />
            </div>
          </div>
          <div className="form-row">
            <label>무료배송 기준 (원)</label>
            <div>
              <input
                type="number"
                min="0"
                placeholder="0이면 미적용"
                defaultValue="50000"
                style={{ width: 120 }}
              />
            </div>
          </div>
          <div className="form-row">
            <label>기본 배송 소요일</label>
            <div>
              <input type="number" min="1" max="30" defaultValue="3" style={{ width: 60 }} /> 일
            </div>
          </div>
          <div className="form-row">
            <label>주문 동기화 주기 (분)</label>
            <div>
              <input type="number" min="5" max="60" defaultValue="15" style={{ width: 60 }} />
              <p className="form-hint">해당 스토어 주문 조회 간격</p>
            </div>
          </div>
          <div className="settings-actions">
            <button type="button" className="btn btn-primary">
              저장
            </button>
            <Link to="/settings/store/list" className="btn">
              목록
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
