import '../../../styles/Settings.css';

const roleOptions = [
  { id: 'menu-dashboard', name: '대시보드', desc: '대시보드 조회' },
  { id: 'menu-product', name: '상품관리', desc: '상품 목록/등록/수정/품절관리' },
  { id: 'menu-order', name: '주문관리', desc: '주문 목록/처리/취소·반품·교환' },
  { id: 'menu-shipping', name: '배송관리', desc: '배송 목록/출고/송장' },
  { id: 'menu-sales', name: '정산·매출', desc: '매출/정산/통계' },
  { id: 'menu-customer', name: '고객관리', desc: '고객/문의/클레임' },
  { id: 'menu-settings', name: '환경설정', desc: '기본설정/사용자/코드/스토어/발주업체' },
  { id: 'menu-system', name: '시스템관리', desc: '권한/메뉴/코드/로그 (운영자)' },
];

const mockRoles = [
  { id: 'admin', name: '관리자', desc: '전체 메뉴 접근' },
  { id: 'seller', name: '셀러', desc: '상품·주문·배송·매출·고객' },
  { id: 'order', name: '주문담당', desc: '주문·배송 위주' },
  { id: 'cs', name: 'CS담당', desc: '고객·문의·클레임' },
];

export default function UserRole() {
  return (
    <div className="settings-page">
      <h1>권한 설정</h1>
      <p className="page-desc">역할별 메뉴 접근 권한을 설정합니다.</p>

      <section className="settings-section">
        <h2>역할 목록</h2>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>역할 코드</th>
                <th>역할명</th>
                <th>설명</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockRoles.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.name}</td>
                  <td>{r.desc}</td>
                  <td className="cell-actions">
                    <a href="#수정">권한 편집</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="settings-section">
        <h2>메뉴별 권한 매트릭스 (역할 편집 시 사용)</h2>
        <p className="form-hint" style={{ marginBottom: 12 }}>
          각 역할에 체크된 메뉴만 접근 가능합니다.
        </p>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>메뉴</th>
                <th>설명</th>
                <th>관리자</th>
                <th>셀러</th>
                <th>주문담당</th>
                <th>CS담당</th>
              </tr>
            </thead>
            <tbody>
              {roleOptions.map((m) => (
                <tr key={m.id}>
                  <td>{m.name}</td>
                  <td>{m.desc}</td>
                  <td>
                    <input type="checkbox" defaultChecked />
                  </td>
                  <td>
                    <input type="checkbox" defaultChecked={!m.id.includes('system')} />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      defaultChecked={['menu-dashboard', 'menu-order', 'menu-shipping'].includes(
                        m.id
                      )}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      defaultChecked={['menu-dashboard', 'menu-customer'].includes(m.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="settings-actions" style={{ marginTop: 16 }}>
          <button type="button" className="btn btn-primary">
            저장
          </button>
        </div>
      </section>
    </div>
  );
}
