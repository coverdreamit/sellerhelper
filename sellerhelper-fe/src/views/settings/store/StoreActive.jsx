import Link from '@/components/Link';
import '../../../styles/Settings.css';

const mockStores = [
  { id: 1, name: '네이버 스마트스토어', status: '활성' },
  { id: 2, name: '쿠팡 로켓배송', status: '활성' },
  { id: 3, name: '11번가', status: '비활성' },
];

export default function StoreActive() {
  return (
    <div className="settings-page">
      <h1>스토어 활성 / 비활성</h1>
      <p className="page-desc">
        연동된 스토어의 주문·동기화 사용 여부를 설정합니다. 비활성 시 해당 스토어 주문은 수집하지
        않습니다.
      </p>

      <section className="settings-section">
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>스토어명</th>
                <th>상태</th>
                <th>변경</th>
              </tr>
            </thead>
            <tbody>
              {mockStores.map((s) => (
                <tr key={s.id}>
                  <td>{s.name}</td>
                  <td>
                    <span className={`badge badge-${s.status === '활성' ? 'active' : 'inactive'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="cell-actions">
                    <button
                      type="button"
                      className="btn"
                      style={{ fontSize: '0.85rem', padding: '4px 10px' }}
                    >
                      {s.status === '활성' ? '비활성으로 변경' : '활성으로 변경'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="settings-actions" style={{ marginTop: 16 }}>
          <Link to="/settings/store/list" className="btn">
            목록
          </Link>
        </div>
      </section>
    </div>
  );
}
