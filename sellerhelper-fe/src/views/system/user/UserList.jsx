import Link from '@/components/Link';
import '../../../styles/Settings.css';

const mockUsers = [
  {
    id: 1,
    name: '홍길동',
    loginId: 'hong',
    email: 'hong@example.com',
    role: '관리자',
    status: '활성',
    lastLogin: '2024-02-06 09:00',
  },
  {
    id: 2,
    name: '김판매',
    loginId: 'seller1',
    email: 'seller1@example.com',
    role: '셀러',
    status: '활성',
    lastLogin: '2024-02-05 18:30',
  },
  {
    id: 3,
    name: '이주문',
    loginId: 'order1',
    email: 'order1@example.com',
    role: '주문담당',
    status: '활성',
    lastLogin: '2024-02-06 08:15',
  },
];

export default function UserList() {
  return (
    <div className="settings-page">
      <h1>사용자 목록</h1>
      <p className="page-desc">시스템 사용자 계정을 조회·관리합니다.</p>

      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <input
              type="text"
              placeholder="이름/아이디 검색"
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <select style={{ padding: '6px 12px' }}>
              <option value="">전체 권한</option>
              <option value="admin">관리자</option>
              <option value="seller">셀러</option>
              <option value="order">주문담당</option>
            </select>
            <button type="button" className="btn">
              검색
            </button>
          </div>
          <Link to="/system/user/register" className="btn btn-primary">
            사용자 등록
          </Link>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>이름</th>
                <th>로그인 ID</th>
                <th>이메일</th>
                <th>권한</th>
                <th>상태</th>
                <th>최근 로그인</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.loginId}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`badge badge-${u.status === '활성' ? 'active' : 'inactive'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>{u.lastLogin}</td>
                  <td className="cell-actions">
                    <a href="#수정">수정</a>
                    <a href="#권한">권한</a>
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
