import '../../../styles/Settings.css';

const mockCodes = [
  {
    groupCode: 'PAY_METHOD',
    groupName: '결제수단',
    code: 'CARD',
    name: '카드',
    sortOrder: 1,
    useYn: 'Y',
  },
  {
    groupCode: 'PAY_METHOD',
    groupName: '결제수단',
    code: 'BANK',
    name: '무통장입금',
    sortOrder: 2,
    useYn: 'Y',
  },
  {
    groupCode: 'PAY_METHOD',
    groupName: '결제수단',
    code: 'MOBILE',
    name: '휴대폰',
    sortOrder: 3,
    useYn: 'Y',
  },
  {
    groupCode: 'INQUIRY_TYPE',
    groupName: '문의유형',
    code: 'PRODUCT',
    name: '상품문의',
    sortOrder: 1,
    useYn: 'Y',
  },
  {
    groupCode: 'INQUIRY_TYPE',
    groupName: '문의유형',
    code: 'DELIVERY',
    name: '배송문의',
    sortOrder: 2,
    useYn: 'Y',
  },
];

export default function CommonCode() {
  return (
    <div className="settings-page">
      <h1>공통 코드</h1>
      <p className="page-desc">공통으로 사용하는 코드 그룹과 코드 값을 관리합니다.</p>

      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 그룹</option>
              <option value="PAY_METHOD">결제수단</option>
              <option value="INQUIRY_TYPE">문의유형</option>
            </select>
            <input
              type="text"
              placeholder="코드/명 검색"
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <button type="button" className="btn">
              검색
            </button>
          </div>
          <button type="button" className="btn btn-primary">
            코드 추가
          </button>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>그룹코드</th>
                <th>그룹명</th>
                <th>코드</th>
                <th>코드명</th>
                <th>정렬순서</th>
                <th>사용여부</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockCodes.map((c, i) => (
                <tr key={`${c.groupCode}-${c.code}-${i}`}>
                  <td>{c.groupCode}</td>
                  <td>{c.groupName}</td>
                  <td>{c.code}</td>
                  <td>{c.name}</td>
                  <td>{c.sortOrder}</td>
                  <td>
                    <span className={`badge badge-${c.useYn === 'Y' ? 'active' : 'inactive'}`}>
                      {c.useYn === 'Y' ? '사용' : '미사용'}
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
