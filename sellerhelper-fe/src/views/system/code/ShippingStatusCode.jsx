import '../../../styles/Settings.css';

const mockShippingStatus = [
  { code: 'PENDING', name: '출고대기', desc: '출고 대기 중', sortOrder: 1, useYn: 'Y' },
  { code: 'PICKING', name: '상품픽킹', desc: '상품 준비 중', sortOrder: 2, useYn: 'Y' },
  { code: 'SHIPPED', name: '배송중', desc: '배송 진행 중', sortOrder: 3, useYn: 'Y' },
  { code: 'DELIVERED', name: '배송완료', desc: '수령 완료', sortOrder: 4, useYn: 'Y' },
  { code: 'FAILED', name: '배송실패', desc: '수령 불가 등', sortOrder: 5, useYn: 'Y' },
];

export default function ShippingStatusCode() {
  return (
    <div className="settings-page">
      <h1>배송 상태 코드</h1>
      <p className="page-desc">배송 진행 단계별 상태 코드를 관리합니다.</p>

      <section className="settings-section">
        <div className="settings-toolbar">
          <input
            type="text"
            placeholder="코드/명 검색"
            style={{ padding: '6px 12px', marginRight: 8 }}
          />
          <button type="button" className="btn">
            검색
          </button>
          <button type="button" className="btn btn-primary">
            상태 추가
          </button>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>코드</th>
                <th>상태명</th>
                <th>설명</th>
                <th>정렬순서</th>
                <th>사용여부</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockShippingStatus.map((s) => (
                <tr key={s.code}>
                  <td>{s.code}</td>
                  <td>{s.name}</td>
                  <td>{s.desc}</td>
                  <td>{s.sortOrder}</td>
                  <td>
                    <span className={`badge badge-${s.useYn === 'Y' ? 'active' : 'inactive'}`}>
                      {s.useYn === 'Y' ? '사용' : '미사용'}
                    </span>
                  </td>
                  <td className="cell-actions">
                    <a href="#수정">수정</a>
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
