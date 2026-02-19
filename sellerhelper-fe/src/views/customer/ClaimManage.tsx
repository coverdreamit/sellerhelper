import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockClaims = [
  {
    id: 'CLM-001',
    type: '클레임',
    orderId: 'ORD-2024-101',
    customer: '홍*동',
    title: '단순 변심 취소 요청',
    status: '접수',
    date: '2024-02-06 13:20',
  },
  {
    id: 'CLM-002',
    type: '클레임',
    orderId: 'ORD-2024-098',
    customer: '김*수',
    title: '불량 반품 요청',
    status: '처리중',
    date: '2024-02-06 11:45',
  },
];

export default function ClaimManage() {
  return (
    <div className="list-page">
      <p className="page-desc">고객 클레임(불만·요청)을 조회하고 처리합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="new">접수</option>
              <option value="processing">처리중</option>
              <option value="done">처리완료</option>
            </select>
            <input
              type="text"
              placeholder="주문번호/고객 검색"
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <button type="button" className="btn">
              검색
            </button>
          </div>
          <Link to="/order/claim" className="btn btn-primary">
            취소·반품·교환
          </Link>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>클레임ID</th>
                <th>주문번호</th>
                <th>고객</th>
                <th>내용</th>
                <th>상태</th>
                <th>등록일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockClaims.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    <Link to={`/order/${c.orderId}`}>{c.orderId}</Link>
                  </td>
                  <td>{c.customer}</td>
                  <td>{c.title}</td>
                  <td>
                    <span
                      className={`badge badge-${c.status === '처리완료' ? 'active' : 'inactive'}`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td>{c.date}</td>
                  <td className="cell-actions">
                    <Link to={`/order/${c.orderId}`}>상세</Link>
                    <a href="#처리">처리</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
