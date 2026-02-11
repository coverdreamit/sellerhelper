import '../../../styles/Settings.css';

export default function CompanyInfo() {
  return (
    <div className="settings-page">
      <h1>회사 / 셀러 정보</h1>
      <p className="page-desc">셀러 및 회사 기본 정보를 등록·수정합니다.</p>

      <section className="settings-section">
        <h2>기본 정보</h2>
        <form className="settings-form">
          <div className="form-row">
            <label className="required">회사명</label>
            <div>
              <input type="text" placeholder="회사(법인)명" defaultValue="" />
            </div>
          </div>
          <div className="form-row">
            <label>사업자등록번호</label>
            <div>
              <input type="text" placeholder="000-00-00000" defaultValue="" />
            </div>
          </div>
          <div className="form-row">
            <label>대표자명</label>
            <div>
              <input type="text" placeholder="대표자 이름" defaultValue="" />
            </div>
          </div>
          <div className="form-row">
            <label>업태 / 업종</label>
            <div>
              <input type="text" placeholder="업태 및 업종" defaultValue="" />
            </div>
          </div>
          <div className="form-row">
            <label className="required">주소</label>
            <div>
              <input type="text" placeholder="우편번호 검색" style={{ marginBottom: 8 }} />
              <input
                type="text"
                placeholder="기본 주소"
                style={{ width: '100%', marginBottom: 4 }}
              />
              <input type="text" placeholder="상세 주소" style={{ width: '100%' }} />
            </div>
          </div>
          <div className="form-row">
            <label>연락처</label>
            <div>
              <input type="text" placeholder="대표 전화번호" defaultValue="" />
            </div>
          </div>
          <div className="form-row">
            <label>이메일</label>
            <div>
              <input type="email" placeholder="대표 이메일" defaultValue="" />
            </div>
          </div>
          <div className="settings-actions">
            <button type="button" className="btn btn-primary">
              저장
            </button>
            <button type="button" className="btn">
              취소
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
