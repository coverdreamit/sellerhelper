import '../../styles/Settings.css';

const mockPeriod = [
  { period: '2024-02', orderCount: 412, amount: 34850000 },
  { period: '2024-01', orderCount: 385, amount: 31200000 },
  { period: '2023-12', orderCount: 420, amount: 36500000 },
];

export default function PeriodSales() {
  return (
    <div className="list-page">
      <h1>기간별 매출 통계</h1>
      <p className="page-desc">월별·기간별 매출·주문 통계를 조회합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <input type="month" style={{ padding: '6px 12px', marginRight: 8 }} />
            <span>~</span>
            <input type="month" style={{ padding: '6px 12px', marginLeft: 8, marginRight: 8 }} />
            <button type="button" className="btn">
              조회
            </button>
          </div>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>기간</th>
                <th>주문건수</th>
                <th>매출금액</th>
              </tr>
            </thead>
            <tbody>
              {mockPeriod.map((r) => (
                <tr key={r.period}>
                  <td>{r.period}</td>
                  <td>{r.orderCount}건</td>
                  <td>₩{r.amount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
