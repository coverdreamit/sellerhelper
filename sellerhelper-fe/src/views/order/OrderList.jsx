import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockOrders = [
  {
    id: 'ORD-2024-001',
    store: '스마트스토어',
    buyer: '홍*동',
    amount: 45000,
    status: '출고대기',
    date: '2024-02-06 14:32',
  },
  {
    id: 'ORD-2024-002',
    store: '쿠팡',
    buyer: '김*수',
    amount: 32000,
    status: '배송중',
    date: '2024-02-06 13:15',
  },
  {
    id: 'ORD-2024-003',
    store: '11번가',
    buyer: '이*영',
    amount: 78000,
    status: '신규주문',
    date: '2024-02-06 12:48',
  },
  {
    id: 'ORD-2024-004',
    store: '스마트스토어',
    buyer: '박*민',
    amount: 25600,
    status: '배송완료',
    date: '2024-02-06 11:20',
  },
];

export default function OrderList() {
  return (
    <div className="list-page">
      <h1>주문 목록</h1>
      <p className="page-desc">전체 주문을 조회·관리합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <input
              type="text"
              placeholder="주문번호/주문자 검색"
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 스토어</option>
              <option value="smartstore">스마트스토어</option>
              <option value="coupang">쿠팡</option>
            </select>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="new">신규주문</option>
              <option value="pending">출고대기</option>
              <option value="shipping">배송중</option>
              <option value="done">배송완료</option>
            </select>
            <input type="date" style={{ padding: '6px 12px', marginRight: 8 }} />
            <button type="button" className="btn">
              검색
            </button>
          </div>
          <Link to="/order/new" className="btn btn-primary">
            신규 주문
          </Link>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>스토어</th>
                <th>주문자</th>
                <th>주문금액</th>
                <th>상태</th>
                <th>주문일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/order/${o.id}`}>{o.id}</Link>
                  </td>
                  <td>{o.store}</td>
                  <td>{o.buyer}</td>
                  <td>₩{o.amount.toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge badge-${o.status === '배송완료' ? 'active' : 'inactive'}`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td>{o.date}</td>
                  <td className="cell-actions">
                    <Link to={`/order/${o.id}`}>상세</Link>
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
