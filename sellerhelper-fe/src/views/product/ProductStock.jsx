import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockProducts = [
  { id: 1, name: 'USB-C 충전 케이블', store: '쿠팡', stock: 3, status: '판매중' },
  { id: 2, name: '스탠드 조명', store: '11번가', stock: 0, status: '품절' },
  { id: 3, name: '휴대폰 케이스', store: '스마트스토어', stock: 0, status: '판매중지' },
];

export default function ProductStock() {
  return (
    <div className="list-page">
      <h1>품절 / 판매중지 관리</h1>
      <p className="page-desc">재고 부족·품절·판매중지 상품을 조회하고 상태를 변경합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="low">재고 부족(10개 이하)</option>
              <option value="out">품절</option>
              <option value="stop">판매중지</option>
            </select>
            <input
              type="text"
              placeholder="상품명 검색"
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
                <th>상품명</th>
                <th>스토어</th>
                <th>재고</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.store}</td>
                  <td>{p.stock}개</td>
                  <td>
                    <span
                      className={`badge badge-${p.status === '판매중' ? 'active' : 'inactive'}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="cell-actions">
                    <button
                      type="button"
                      className="btn"
                      style={{ fontSize: '0.85rem', padding: '4px 10px' }}
                    >
                      재고 입력
                    </button>
                    <button
                      type="button"
                      className="btn"
                      style={{ fontSize: '0.85rem', padding: '4px 10px' }}
                    >
                      {p.status === '판매중지' ? '판매 재개' : '판매중지'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 16 }}>
          <Link to="/product/list" className="btn">
            상품 목록
          </Link>
        </div>
      </section>
    </div>
  );
}
