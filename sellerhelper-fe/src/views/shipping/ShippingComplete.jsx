import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockComplete = [
  {
    orderId: 'ORD-2024-004',
    store: '스마트스토어',
    buyer: '박*민',
    carrier: 'CJ대한통운',
    invoice: '1234567888',
    delivered: '2024-02-06 18:00',
  },
];

export default function ShippingComplete() {
  return (
    <div className="list-page">
      <h1>배송 완료</h1>
      <p className="page-desc">배송 완료된 건을 조회합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <input type="date" style={{ padding: '6px 12px', marginRight: 8 }} />
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
                <th>주문번호</th>
                <th>스토어</th>
                <th>수령인</th>
                <th>택배사</th>
                <th>송장번호</th>
                <th>배송완료일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockComplete.map((s) => (
                <tr key={s.orderId}>
                  <td>
                    <Link to={`/order/${s.orderId}`}>{s.orderId}</Link>
                  </td>
                  <td>{s.store}</td>
                  <td>{s.buyer}</td>
                  <td>{s.carrier}</td>
                  <td>{s.invoice}</td>
                  <td>{s.delivered}</td>
                  <td className="cell-actions">
                    <Link to={`/order/${s.orderId}`}>상세</Link>
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
