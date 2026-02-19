import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockCustomers = [
  {
    id: 1,
    name: '홍길동',
    email: 'hong***@example.com',
    phone: '010-****-5678',
    orderCount: 12,
    lastOrder: '2024-02-05',
  },
  {
    id: 2,
    name: '김판매',
    email: 'kim***@example.com',
    phone: '010-****-1234',
    orderCount: 5,
    lastOrder: '2024-02-04',
  },
];

export default function CustomerList() {
  return (
    <div className="list-page">
      <p className="page-desc">구매 고객 목록을 조회합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <input
              type="text"
              placeholder="이름/이메일/연락처 검색"
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
                <th>이름</th>
                <th>이메일</th>
                <th>연락처</th>
                <th>주문횟수</th>
                <th>최근 주문일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockCustomers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>{c.orderCount}건</td>
                  <td>{c.lastOrder}</td>
                  <td className="cell-actions">
                    <a href="#상세">상세</a>
                    <Link to="/customer/inquiry">문의</Link>
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
