import Link from '@/components/Link';
import '../../styles/Settings.css';

export default function InvoiceManage() {
  return (
    <div className="list-page">
      <h1>송장 관리</h1>
      <p className="page-desc">출고 대기 건에 송장을 입력하고 발송 처리합니다.</p>
      <section className="settings-section">
        <h2>송장 입력</h2>
        <form className="settings-form">
          <div className="form-row">
            <label className="required">주문번호</label>
            <div>
              <input type="text" placeholder="주문번호" />
            </div>
          </div>
          <div className="form-row">
            <label className="required">택배사</label>
            <div>
              <select>
                <option value="">선택</option>
                <option value="CJ">CJ대한통운</option>
                <option value="HANJIN">한진택배</option>
                <option value="LOTTE">롯데택배</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <label className="required">송장번호</label>
            <div>
              <input type="text" placeholder="송장번호" />
            </div>
          </div>
          <div className="settings-actions">
            <button type="button" className="btn btn-primary">
              발송 처리
            </button>
            <Link to="/shipping/pending" className="btn">
              출고 대기 목록
            </Link>
          </div>
        </form>
      </section>
      <section className="settings-section">
        <h2>최근 송장 입력 내역</h2>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>택배사</th>
                <th>송장번호</th>
                <th>입력일시</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <Link to="/order/ORD-2024-002">ORD-2024-002</Link>
                </td>
                <td>CJ대한통운</td>
                <td>1234567890</td>
                <td>2024-02-06 13:20</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
