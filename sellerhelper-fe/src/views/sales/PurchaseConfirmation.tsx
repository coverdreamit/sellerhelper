import '../../styles/Settings.css';

const mockItems = [
  { id: 'ORD-202402-001', product: '상품A', store: '스마트스토어', orderDate: '2024-02-01', confirmDate: '-', amount: 45000, status: '대기' },
  { id: 'ORD-202402-002', product: '상품B', store: '쿠팡', orderDate: '2024-02-02', confirmDate: '2024-02-08', amount: 28000, status: '확정' },
  { id: 'ORD-202402-003', product: '상품C', store: '11번가', orderDate: '2024-02-03', confirmDate: '-', amount: 62000, status: '대기' },
];

export default function PurchaseConfirmation() {
  return (
    <div className="list-page">
      <h1>구매확정 관리</h1>
      <p className="page-desc">구매확정 대기·완료 내역을 조회하고 관리합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="pending">구매확정 대기</option>
              <option value="done">구매확정 완료</option>
            </select>
            <input type="date" style={{ padding: '6px 12px', marginRight: 8 }} />
            <span>~</span>
            <input type="date" style={{ padding: '6px 12px', marginLeft: 8, marginRight: 8 }} />
            <button type="button" className="btn">
              검색
            </button>
          </div>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>주문ID</th>
                <th>상품</th>
                <th>스토어</th>
                <th>주문일</th>
                <th>구매확정일</th>
                <th>금액</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockItems.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.product}</td>
                  <td>{r.store}</td>
                  <td>{r.orderDate}</td>
                  <td>{r.confirmDate}</td>
                  <td>₩{r.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${r.status === '확정' ? 'active' : 'inactive'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="cell-actions">
                    {r.status === '대기' && <a href="#확정">확정처리</a>}
                    {r.status === '확정' && <a href="#상세">상세</a>}
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
