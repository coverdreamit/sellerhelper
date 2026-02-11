import Link from '@/components/Link';
import '../../../styles/Settings.css';

export default function UserRegister() {
  return (
    <div className="settings-page">
      <h1>사용자 등록</h1>
      <p className="page-desc">새 사용자 계정을 등록합니다.</p>

      <section className="settings-section">
        <h2>계정 정보</h2>
        <form className="settings-form">
          <div className="form-row">
            <label className="required">이름</label>
            <div>
              <input type="text" placeholder="사용자 이름" />
            </div>
          </div>
          <div className="form-row">
            <label className="required">로그인 ID</label>
            <div>
              <input type="text" placeholder="로그인에 사용할 ID" />
              <p className="form-hint">영문, 숫자 조합 4자 이상</p>
            </div>
          </div>
          <div className="form-row">
            <label className="required">비밀번호</label>
            <div>
              <input type="password" placeholder="비밀번호" />
            </div>
          </div>
          <div className="form-row">
            <label className="required">비밀번호 확인</label>
            <div>
              <input type="password" placeholder="비밀번호 재입력" />
            </div>
          </div>
          <div className="form-row">
            <label className="required">이메일</label>
            <div>
              <input type="email" placeholder="example@email.com" />
            </div>
          </div>
          <div className="form-row">
            <label>연락처</label>
            <div>
              <input type="text" placeholder="010-0000-0000" />
            </div>
          </div>
          <div className="form-row">
            <label className="required">권한</label>
            <div>
              <select>
                <option value="">선택</option>
                <option value="admin">관리자</option>
                <option value="seller">셀러</option>
                <option value="order">주문담당</option>
                <option value="cs">CS담당</option>
              </select>
            </div>
          </div>
          <div className="settings-actions">
            <button type="button" className="btn btn-primary">
              등록
            </button>
            <Link to="/system/user" className="btn">
              취소
            </Link>
          </div>
        </form>
      </section>
    </div>
  );
}
