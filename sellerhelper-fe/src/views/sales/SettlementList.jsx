import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockSettlements = [
  {
    id: 'STL-202402-001',
    period: '2024-02-01 ~ 2024-02-07',
    store: '스마트스토어',
    amount: 12500000,
    status: '정산예정',
    date: '2024-02-08',
  },
  {
    id: 'STL-202401-002',
    period: '2024-01-25 ~ 2024-01-31',
    store: '쿠팡',
    amount: 8200000,
    status: '정산완료',
    date: '2024-02-05',
  },
];

export default function SettlementList() {
  return (
    <div className="list-page">
      <h1>정산 내역</h1>
      <p className="page-desc">스토어별 정산 내역을 조회합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="scheduled">정산예정</option>
              <option value="done">정산완료</option>
            </select>
            <input type="month" style={{ padding: '6px 12px', marginRight: 8 }} />
            <button type="button" className="btn">
              검색
            </button>
          </div>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>정산ID</th>
                <th>정산 기간</th>
                <th>스토어</th>
                <th>정산 금액</th>
                <th>상태</th>
                <th>정산일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockSettlements.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.period}</td>
                  <td>{s.store}</td>
                  <td>₩{s.amount.toLocaleString()}</td>
                  <td>
                    <span
                      className={`badge badge-${s.status === '정산완료' ? 'active' : 'inactive'}`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td>{s.date}</td>
                  <td className="cell-actions">
                    <a href="#상세">상세</a>
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
