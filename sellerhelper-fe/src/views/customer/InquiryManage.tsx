import Link from '@/components/Link';
import '../../styles/Settings.css';

const mockInquiries = [
  {
    id: 1,
    type: '상품문의',
    product: '무선 이어폰 블랙',
    customer: '홍*동',
    title: '배송일 문의',
    status: '미답변',
    date: '2024-02-06 14:00',
  },
  {
    id: 2,
    type: '배송문의',
    product: '-',
    customer: '김*수',
    title: '교환 요청',
    status: '답변완료',
    date: '2024-02-05 11:20',
  },
];

export default function InquiryManage() {
  return (
    <div className="list-page">
      <h1>문의 관리</h1>
      <p className="page-desc">고객 문의를 조회하고 답변합니다.</p>
      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 유형</option>
              <option value="product">상품문의</option>
              <option value="delivery">배송문의</option>
            </select>
            <select style={{ padding: '6px 12px', marginRight: 8 }}>
              <option value="">전체 상태</option>
              <option value="pending">미답변</option>
              <option value="done">답변완료</option>
            </select>
            <input
              type="text"
              placeholder="제목/내용 검색"
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
                <th>유형</th>
                <th>관련 상품</th>
                <th>문의자</th>
                <th>제목</th>
                <th>상태</th>
                <th>등록일시</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockInquiries.map((i) => (
                <tr key={i.id}>
                  <td>{i.type}</td>
                  <td>{i.product}</td>
                  <td>{i.customer}</td>
                  <td>{i.title}</td>
                  <td>
                    <span
                      className={`badge badge-${i.status === '답변완료' ? 'active' : 'inactive'}`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td>{i.date}</td>
                  <td className="cell-actions">
                    <a href="#답변">답변</a>
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
