import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockStoreSales = [
  { store: '스마트스토어', orderCount: 156, amount: 18420000, rate: 52 },
  { store: '쿠팡', orderCount: 98, amount: 11200000, rate: 32 },
  { store: '11번가', orderCount: 45, amount: 5230000, rate: 16 },
];

export default function StoreSales() {
  const total = mockStoreSales.reduce((s, r) => s + r.amount, 0);
  return (
    <div className="list-page">
      <h1>스토어별 매출</h1>
      <p className="page-desc">스토어별 매출·주문 현황을 조회합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <input type="month" style={{ padding: '6px 12px', marginRight: 8 }} />
            <button type="button" className="btn">
              조회
            </button>
          </div>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>스토어</th>
                <th>주문건수</th>
                <th>매출금액</th>
                <th>비중</th>
              </tr>
            </thead>
            <tbody>
              {mockStoreSales.map((s) => (
                <tr key={s.store}>
                  <td>{s.store}</td>
                  <td>{s.orderCount}건</td>
                  <td>₩{s.amount.toLocaleString()}</td>
                  <td>{s.rate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <strong>합계 ₩{total.toLocaleString()}</strong>
        </div>
      </section>
    </div>
  );
}
