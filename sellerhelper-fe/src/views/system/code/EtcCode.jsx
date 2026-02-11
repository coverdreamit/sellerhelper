import '../../../styles/Settings.css';

const mockEtcCodes = [
  {
    groupCode: 'CLAIM_TYPE',
    groupName: '클레임 유형',
    code: 'CANCEL',
    name: '취소',
    sortOrder: 1,
    useYn: 'Y',
  },
  {
    groupCode: 'CLAIM_TYPE',
    groupName: '클레임 유형',
    code: 'RETURN',
    name: '반품',
    sortOrder: 2,
    useYn: 'Y',
  },
  {
    groupCode: 'CLAIM_TYPE',
    groupName: '클레임 유형',
    code: 'EXCHANGE',
    name: '교환',
    sortOrder: 3,
    useYn: 'Y',
  },
  {
    groupCode: 'CARRIER',
    groupName: '택배사',
    code: 'CJ',
    name: 'CJ대한통운',
    sortOrder: 1,
    useYn: 'Y',
  },
  {
    groupCode: 'CARRIER',
    groupName: '택배사',
    code: 'HANJIN',
    name: '한진택배',
    sortOrder: 2,
    useYn: 'Y',
  },
];

export default function EtcCode() {
  return (
    <div className="settings-page">
      <h1>기타 관리 코드</h1>
      <p className="page-desc">클레임 유형, 택배사 등 기타 공통 코드를 관리합니다.</p>

      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 그룹</option>
              <option value="CLAIM_TYPE">클레임 유형</option>
              <option value="CARRIER">택배사</option>
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
              {mockEtcCodes.map((c, i) => (
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
