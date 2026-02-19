import Link from '@/components/Link';
import '../../../styles/Settings.css';

export default function SupplierEdit() {
  return (
    <div className="settings-page">
      <p className="page-desc">발주 업체 정보를 등록하거나 수정합니다.</p>

      <section className="settings-section">
        <h2>기본 정보</h2>
        <form className="settings-form">
          <div className="form-row">
            <label className="required">업체명</label>
            <div>
              <input type="text" placeholder="업체(법인)명" />
            </div>
          </div>
          <div className="form-row">
            <label className="required">사업자등록번호</label>
            <div>
              <input type="text" placeholder="000-00-00000" />
            </div>
          </div>
          <div className="form-row">
            <label>대표자명</label>
            <div>
              <input type="text" placeholder="대표자 이름" />
            </div>
          </div>
          <div className="form-row">
            <label>주소</label>
            <div>
              <input
                type="text"
                placeholder="기본 주소"
                style={{ width: '100%', marginBottom: 4 }}
              />
              <input type="text" placeholder="상세 주소" style={{ width: '100%' }} />
            </div>
          </div>
          <div className="form-row">
            <label className="required">연락처</label>
            <div>
              <input type="text" placeholder="대표 전화번호" />
            </div>
          </div>
          <div className="form-row">
            <label>이메일</label>
            <div>
              <input type="email" placeholder="대표 이메일" />
            </div>
          </div>
          <div className="form-row">
            <label>비고</label>
            <div>
              <textarea placeholder="메모 사항" />
            </div>
          </div>
          <div className="form-row">
            <label>사용 여부</label>
            <div className="form-check">
              <input type="checkbox" id="supplier-use" defaultChecked />
              <label htmlFor="supplier-use">사용</label>
            </div>
          </div>
          <div className="settings-actions">
            <button type="button" className="btn btn-primary">
              저장
            </button>
            <Link to="/settings/supplier/list" className="btn">
              목록
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
