import Link from '@/components/Link';
import '../../styles/Settings.css';

export default function ProductEdit() {
  return (
    <div className="list-page settings-page">
      <h1>상품 수정</h1>
      <p className="page-desc">등록된 상품 정보를 수정합니다.</p>
      <section className="settings-section">
        <h2>기본 정보</h2>
        <form className="settings-form">
          <div className="form-row">
            <label className="required">상품명</label>
            <div>
              <input type="text" placeholder="상품명" defaultValue="무선 이어폰 블랙" />
            </div>
          </div>
          <div className="form-row">
            <label>스토어</label>
            <div>
              <select defaultValue="smartstore">
                <option value="smartstore">스마트스토어</option>
                <option value="coupang">쿠팡</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label className="required">판매가(원)</label>
            <div>
              <input type="number" min="0" defaultValue="29000" />
            </div>
          </div>
          <div className="form-row">
            <label className="required">재고 수량</label>
            <div>
              <input type="number" min="0" defaultValue="45" />
            </div>
          </div>
          <div className="form-row">
            <label>상품 설명</label>
            <div>
              <textarea placeholder="상품 상세 설명" />
            </div>
          </div>
          <div className="settings-actions">
            <button type="button" className="btn btn-primary">
              저장
            </button>
            <Link to="/product/list" className="btn">
              취소
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
