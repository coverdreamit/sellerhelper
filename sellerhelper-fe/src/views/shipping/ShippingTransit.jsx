import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockTransit = [
  {
    orderId: 'ORD-2024-002',
    store: '쿠팡',
    buyer: '김*수',
    carrier: 'CJ대한통운',
    invoice: '1234567890',
    shipDate: '2024-02-06 13:20',
  },
];

export default function ShippingTransit() {
  return (
    <div className="list-page">
      <h1>배송중</h1>
      <p className="page-desc">배송 진행 중인 건을 조회합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <input
              type="text"
              placeholder="주문번호/송장번호 검색"
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
                <th>주문번호</th>
                <th>스토어</th>
                <th>수령인</th>
                <th>택배사</th>
                <th>송장번호</th>
                <th>발송일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockTransit.map((s) => (
                <tr key={s.orderId}>
                  <td>
                    <Link to={`/order/${s.orderId}`}>{s.orderId}</Link>
                  </td>
                  <td>{s.store}</td>
                  <td>{s.buyer}</td>
                  <td>{s.carrier}</td>
                  <td>{s.invoice}</td>
                  <td>{s.shipDate}</td>
                  <td className="cell-actions">
                    <Link to={`/order/${s.orderId}`}>상세</Link>
                    <a href="#배송추적" target="_blank" rel="noopener noreferrer">
                      배송추적
                    </a>
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
