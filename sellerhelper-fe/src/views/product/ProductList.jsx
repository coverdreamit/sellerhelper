import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockProducts = [
  {
    id: 1,
    name: '무선 이어폰 블랙',
    store: '스마트스토어',
    price: 29000,
    stock: 45,
    status: '판매중',
    updated: '2024-02-06',
  },
  {
    id: 2,
    name: 'USB-C 충전 케이블',
    store: '쿠팡',
    price: 8900,
    stock: 3,
    status: '판매중',
    updated: '2024-02-06',
  },
  {
    id: 3,
    name: '스탠드 조명',
    store: '11번가',
    price: 35000,
    stock: 0,
    status: '품절',
    updated: '2024-02-05',
  },
  {
    id: 4,
    name: '키보드 패드',
    store: '스마트스토어',
    price: 15000,
    stock: 120,
    status: '판매중',
    updated: '2024-02-05',
  },
];

export default function ProductList() {
  return (
    <div className="list-page">
      <h1>상품 목록</h1>
      <p className="page-desc">등록된 상품을 조회·관리합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <input
              type="text"
              placeholder="상품명 검색"
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 스토어</option>
              <option value="smartstore">스마트스토어</option>
              <option value="coupang">쿠팡</option>
            </select>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="on">판매중</option>
              <option value="out">품절</option>
              <option value="stop">판매중지</option>
            </select>
            <button type="button" className="btn">
              검색
            </button>
          </div>
          <Link to="/product/register" className="btn btn-primary">
            상품 등록
          </Link>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>상품명</th>
                <th>스토어</th>
                <th>판매가</th>
                <th>재고</th>
                <th>상태</th>
                <th>수정일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockProducts.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.store}</td>
                  <td>₩{p.price.toLocaleString()}</td>
                  <td>{p.stock}개</td>
                  <td>
                    <span
                      className={`badge badge-${p.status === '판매중' ? 'active' : 'inactive'}`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td>{p.updated}</td>
                  <td className="cell-actions">
                    <Link to="/product/edit">수정</Link>
                    <Link to="/product/stock">재고/품절</Link>
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
