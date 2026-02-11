import Link from '@/components/Link';
import '../../styles/Settings.css';

const summary = [
  { label: '오늘 매출', value: 1842000, unit: '원' },
  { label: '이번 달 매출', value: 32450000, unit: '원' },
  { label: '오늘 주문', value: 24, unit: '건' },
  { label: '이번 달 주문', value: 412, unit: '건' },
];

export default function SalesStatus() {
  return (
    <div className="list-page">
      <h1>매출 현황</h1>
      <p className="page-desc">매출·주문 현황을 조회합니다.</p>
      <section className="settings-section">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {summary.map((s) => (
            <div key={s.label} style={{ padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>{s.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {s.unit === '원' ? `₩${Number(s.value).toLocaleString()}` : `${s.value}${s.unit}`}
              </div>
            </div>
          ))}
        </div>
        <div className="settings-toolbar">
          <div>
            <input type="date" style={{ padding: '6px 12px', marginRight: 8 }} />
            <span>~</span>
            <input type="date" style={{ padding: '6px 12px', marginLeft: 8, marginRight: 8 }} />
            <button type="button" className="btn">
              조회
            </button>
          </div>
          <Link to="/sales/period" className="btn btn-primary">
            기간별 통계
          </Link>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>일자</th>
                <th>주문건수</th>
                <th>매출금액</th>
                <th>취소/반품</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '2024-02-06', count: 24, amount: 1842000, claim: 2 },
                { date: '2024-02-05', count: 31, amount: 2560000, claim: 1 },
                { date: '2024-02-04', count: 28, amount: 2120000, claim: 0 },
              ].map((r) => (
                <tr key={r.date}>
                  <td>{r.date}</td>
                  <td>{r.count}건</td>
                  <td>₩{r.amount.toLocaleString()}</td>
                  <td>{r.claim}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
