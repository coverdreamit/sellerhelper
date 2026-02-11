import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockNewOrders = [
  {
    id: 'ORD-2024-010',
    store: '스마트스토어',
    buyer: '최*희',
    amount: 52000,
    date: '2024-02-06 15:00',
  },
  { id: 'ORD-2024-011', store: '쿠팡', buyer: '정*수', amount: 18500, date: '2024-02-06 14:55' },
  { id: 'ORD-2024-012', store: '11번가', buyer: '강*민', amount: 94000, date: '2024-02-06 14:48' },
];

export default function OrderNew() {
  return (
    <div className="list-page">
      <h1>신규 주문</h1>
      <p className="page-desc">결제 완료된 신규 주문을 확인하고 처리합니다.</p>
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
                <th>주문자</th>
                <th>주문금액</th>
                <th>주문일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockNewOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td>
                    <Link to={`/order/${o.id}`}>{o.id}</Link>
                  </td>
                  <td>{o.store}</td>
                  <td>{o.buyer}</td>
                  <td>₩{o.amount.toLocaleString()}</td>
                  <td>{o.date}</td>
                  <td className="cell-actions">
                    <Link to={`/order/${o.id}`}>확인</Link>
                    <button
                      type="button"
                      className="btn"
                      style={{ fontSize: '0.85rem', padding: '4px 10px' }}
                    >
                      주문확인
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="settings-actions" style={{ marginTop: 16 }}>
          <button type="button" className="btn btn-primary">
            선택 주문 확인 처리
          </button>
          <Link to="/order/list" className="btn">
            주문 목록
          </Link>
        </div>
      </section>
    </div>
  );
}
