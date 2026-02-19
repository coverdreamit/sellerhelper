import Link from '@/components/Link';
import '../../styles/Settings.css';

export default function ProductRegister() {
  return (
    <div className="list-page settings-page">
      <p className="page-desc">새 상품을 등록합니다.</p>
      <section className="settings-section">
        <h2>기본 정보</h2>
        <form className="settings-form">
          <div className="form-row">
            <label className="required">상품명</label>
            <div>
              <input type="text" placeholder="상품명" />
            </div>
          </div>
          <div className="form-row">
            <label className="required">스토어</label>
            <div>
              <select>
                <option value="">선택</option>
                <option value="smartstore">스마트스토어</option>
                <option value="coupang">쿠팡</option>
                <option value="11st">11번가</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label>카테고리</label>
            <div>
              <select>
                <option value="">선택</option>
                <option value="1">디지털/가전</option>
                <option value="2">패션</option>
                <option value="3">생활</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label className="required">판매가(원)</label>
            <div>
              <input type="number" min="0" placeholder="0" />
            </div>
          </div>
          <div className="form-row">
            <label className="required">재고 수량</label>
            <div>
              <input type="number" min="0" placeholder="0" />
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
              등록
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
