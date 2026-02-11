import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockShipping = [
  {
    orderId: 'ORD-2024-001',
    store: '스마트스토어',
    buyer: '홍*동',
    status: '출고대기',
    invoice: '-',
    date: '2024-02-06 14:32',
  },
  {
    orderId: 'ORD-2024-002',
    store: '쿠팡',
    buyer: '김*수',
    status: '배송중',
    invoice: 'CJ 1234567890',
    date: '2024-02-06 13:15',
  },
  {
    orderId: 'ORD-2024-004',
    store: '스마트스토어',
    buyer: '박*민',
    status: '배송완료',
    invoice: 'CJ 1234567888',
    date: '2024-02-06 11:20',
  },
];

export default function ShippingList() {
  return (
    <div className="list-page">
      <h1>배송 목록</h1>
      <p className="page-desc">전체 배송 건을 조회·관리합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="pending">출고대기</option>
              <option value="shipping">배송중</option>
              <option value="done">배송완료</option>
            </select>
            <input
              type="text"
              placeholder="주문번호/송장번호 검색"
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <input type="date" style={{ padding: '6px 12px', marginRight: 8 }} />
            <button type="button" className="btn">
              검색
            </button>
          </div>
          <Link to="/shipping/pending" className="btn btn-primary">
            출고 대기
          </Link>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>주문번호</th>
                <th>스토어</th>
                <th>수령인</th>
                <th>상태</th>
                <th>송장번호</th>
                <th>주문일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockShipping.map((s) => (
                <tr key={s.orderId}>
                  <td>
                    <Link to={`/order/${s.orderId}`}>{s.orderId}</Link>
                  </td>
                  <td>{s.store}</td>
                  <td>{s.buyer}</td>
                  <td>
                    <span className="badge badge-active">{s.status}</span>
                  </td>
                  <td>{s.invoice}</td>
                  <td>{s.date}</td>
                  <td className="cell-actions">
                    <Link to={`/order/${s.orderId}`}>상세</Link>
                    {s.status === '출고대기' && <Link to="/shipping/invoice">송장 입력</Link>}
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
