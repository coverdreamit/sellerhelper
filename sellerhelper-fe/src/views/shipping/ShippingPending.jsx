import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockPending = [
  {
    orderId: 'ORD-2024-001',
    store: '스마트스토어',
    buyer: '홍*동',
    amount: 45000,
    orderDate: '2024-02-06 14:32',
  },
  {
    orderId: 'ORD-2024-005',
    store: 'G마켓',
    buyer: '김*수',
    amount: 125000,
    orderDate: '2024-02-06 10:05',
  },
];

export default function ShippingPending() {
  return (
    <div className="list-page">
      <h1>출고 대기</h1>
      <p className="page-desc">출고 대기 중인 주문을 확인하고 송장을 입력합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <input
              type="text"
              placeholder="주문번호 검색"
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <button type="button" className="btn">
              검색
            </button>
          </div>
          <Link to="/shipping/invoice" className="btn btn-primary">
            송장 일괄 입력
          </Link>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" title="전체선택" />
                </th>
                <th>주문번호</th>
                <th>스토어</th>
                <th>수령인</th>
                <th>주문금액</th>
                <th>주문일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockPending.map((s) => (
                <tr key={s.orderId}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <Link to={`/order/${s.orderId}`}>{s.orderId}</Link>
                  </td>
                  <td>{s.store}</td>
                  <td>{s.buyer}</td>
                  <td>₩{s.amount.toLocaleString()}</td>
                  <td>{s.orderDate}</td>
                  <td className="cell-actions">
                    <Link to="/shipping/invoice">송장 입력</Link>
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
