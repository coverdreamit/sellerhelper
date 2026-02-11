import Link from '@/components/Link';
import '../../../styles/Settings.css';

export default function StoreAuth() {
  return (
    <div className="settings-page">
      <h1>스토어 API 인증</h1>
      <p className="page-desc">쇼핑몰 스토어 API 연동을 위한 인증 정보를 등록·갱신합니다.</p>

      <section className="settings-section">
        <h2>스토어 선택 및 인증</h2>
        <form className="settings-form">
          <div className="form-row">
            <label className="required">스토어</label>
            <div>
              <select>
                <option value="">선택</option>
                <option value="SMARTSTORE">네이버 스마트스토어</option>
                <option value="COUPANG">쿠팡</option>
                <option value="11ST">11번가</option>
                <option value="GMARKET">G마켓</option>
                <option value="AUCTION">옥션</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label>Client ID / API Key</label>
            <div>
              <input type="text" placeholder="스토어에서 발급받은 Client ID 또는 API Key" />
            </div>
          </div>
          <div className="form-row">
            <label>Client Secret / Secret Key</label>
            <div>
              <input type="password" placeholder="Client Secret 또는 Secret Key" />
              <p className="form-hint">
                각 스토어 개발자 센터에서 발급받은 인증 정보를 입력하세요.
              </p>
            </div>
          </div>
          <div className="form-row">
            <label>Seller Key / Shop ID (해당 시)</label>
            <div>
              <input type="text" placeholder="스토어별 셀러 키 또는 샵 ID" />
            </div>
          </div>
          <div className="settings-actions">
            <button type="button" className="btn btn-primary">
              연동 테스트
            </button>
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
