import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockClaims = [
  {
    id: 'CLM-001',
    orderId: 'ORD-2024-101',
    type: '취소',
    amount: 35000,
    status: '요청접수',
    date: '2024-02-06 13:20',
  },
  {
    id: 'CLM-002',
    orderId: 'ORD-2024-098',
    type: '반품',
    amount: 52000,
    status: '처리중',
    date: '2024-02-06 11:45',
  },
  {
    id: 'CLM-003',
    orderId: 'ORD-2024-095',
    type: '교환',
    amount: 28000,
    status: '요청접수',
    date: '2024-02-06 10:10',
  },
];

export default function OrderClaim() {
  return (
    <div className="list-page">
      <h1>취소 / 반품 / 교환</h1>
      <p className="page-desc">취소·반품·교환 요청을 조회하고 처리합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 유형</option>
              <option value="cancel">취소</option>
              <option value="return">반품</option>
              <option value="exchange">교환</option>
            </select>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="request">요청접수</option>
              <option value="processing">처리중</option>
              <option value="done">처리완료</option>
            </select>
            <input
              type="text"
              placeholder="주문번호/클레임번호 검색"
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <button type="button" className="btn">
              검색
            </button>
          </div>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>클레임번호</th>
                <th>주문번호</th>
                <th>유형</th>
                <th>금액</th>
                <th>상태</th>
                <th>신청일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockClaims.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/order/${c.orderId}`}>{c.id}</Link>
                  </td>
                  <td>
                    <Link to={`/order/${c.orderId}`}>{c.orderId}</Link>
                  </td>
                  <td>
                    <span
                      className={`badge ${c.type === '취소' ? 'badge-inactive' : 'badge-active'}`}
                    >
                      {c.type}
                    </span>
                  </td>
                  <td>₩{c.amount.toLocaleString()}</td>
                  <td>{c.status}</td>
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
