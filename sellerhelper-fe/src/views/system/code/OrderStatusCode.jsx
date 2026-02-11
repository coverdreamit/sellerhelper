import '../../../styles/Settings.css';

const mockOrderStatus = [
  { code: 'NEW', name: '신규주문', desc: '결제 완료, 미처리', sortOrder: 1, useYn: 'Y' },
  { code: 'CONFIRM', name: '주문확인', desc: '주문 확인 완료', sortOrder: 2, useYn: 'Y' },
  { code: 'PREPARE', name: '상품준비중', desc: '출고 준비 중', sortOrder: 3, useYn: 'Y' },
  { code: 'SHIPPED', name: '배송중', desc: '배송 진행 중', sortOrder: 4, useYn: 'Y' },
  { code: 'DELIVERED', name: '배송완료', desc: '수령 완료', sortOrder: 5, useYn: 'Y' },
  { code: 'CANCEL', name: '취소', desc: '주문 취소', sortOrder: 6, useYn: 'Y' },
  { code: 'RETURN', name: '반품', desc: '반품 처리', sortOrder: 7, useYn: 'Y' },
  { code: 'EXCHANGE', name: '교환', desc: '교환 처리', sortOrder: 8, useYn: 'Y' },
];

export default function OrderStatusCode() {
  return (
    <div className="settings-page">
      <h1>주문 상태 코드</h1>
      <p className="page-desc">주문 진행 단계별 상태 코드를 관리합니다.</p>

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
              {mockOrderStatus.map((s) => (
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
