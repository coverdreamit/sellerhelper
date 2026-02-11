import '../../../styles/Settings.css';

export default function NotificationSetting() {
  return (
    <div className="settings-page">
      <h1>알림 설정</h1>
      <p className="page-desc">주문, 문의 등 이벤트 발생 시 알림 방식을 설정합니다.</p>

      <section className="settings-section">
        <h2>알림 채널</h2>
        <form className="settings-form">
          <div className="form-row">
            <label>이메일 알림</label>
            <div className="form-check">
              <input type="checkbox" id="email-on" defaultChecked />
              <label htmlFor="email-on">이메일로 알림 수신</label>
            </div>
          </div>
          <div className="form-row">
            <label>알림 수신 이메일</label>
            <div>
              <input type="email" placeholder="알림을 받을 이메일 주소" defaultValue="" />
            </div>
          </div>
          <div className="form-row">
            <label>문자(SMS) 알림</label>
            <div className="form-check">
              <input type="checkbox" id="sms-on" />
              <label htmlFor="sms-on">문자로 알림 수신</label>
            </div>
          </div>
          <div className="form-row">
            <label>알림 수신 연락처</label>
            <div>
              <input type="text" placeholder="010-0000-0000" defaultValue="" />
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
        <h2>알림 대상 이벤트</h2>
        <form className="settings-form">
          <div className="form-check-group">
            <div className="form-check-item">
              <input type="checkbox" id="evt-order" defaultChecked />
              <label htmlFor="evt-order">신규 주문 접수 시</label>
            </div>
            <div className="form-check-item">
              <input type="checkbox" id="evt-cancel" defaultChecked />
              <label htmlFor="evt-cancel">취소/반품/교환 요청 시</label>
            </div>
            <div className="form-check-item">
              <input type="checkbox" id="evt-inquiry" defaultChecked />
              <label htmlFor="evt-inquiry">신규 문의 접수 시</label>
            </div>
            <div className="form-check-item">
              <input type="checkbox" id="evt-review" />
              <label htmlFor="evt-review">신규 리뷰 등록 시</label>
            </div>
            <div className="form-check-item">
              <input type="checkbox" id="evt-settlement" defaultChecked />
              <label htmlFor="evt-settlement">정산 완료 시</label>
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
