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
    id: 'ORD-2024-005',
    store: 'G마켓',
    buyer: '김*수',
    amount: 125000,
    status: '출고대기',
    date: '2024-02-06 10:05',
  },
  {
    id: 'ORD-2024-002',
    store: '쿠팡',
    buyer: '이*영',
    amount: 32000,
    status: '배송중',
    date: '2024-02-06 13:15',
  },
];

export default function OrderProcessing() {
  return (
    <div className="list-page">
      <h1>처리중 주문</h1>
      <p className="page-desc">출고 대기·배송중 등 처리 중인 주문을 조회합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="pending">출고대기</option>
              <option value="shipping">배송중</option>
            </select>
            <input
              type="text"
              placeholder="주문번호 검색"
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <button type="button" className="btn">
              검색
            </button>
          </div>
          <Link to="/shipping/pending" className="btn btn-primary">
            출고 처리
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
                    <span className="badge badge-active">{o.status}</span>
                  </td>
                  <td>{o.date}</td>
                  <td className="cell-actions">
                    <Link to={`/order/${o.id}`}>상세</Link>
                    {o.status === '출고대기' && <Link to="/shipping/invoice">송장 입력</Link>}
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
