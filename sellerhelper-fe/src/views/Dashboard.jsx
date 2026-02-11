import Link from '@/components/Link';
import './Dashboard.css';

// 임시 목업 (백엔드 연동 시 API로 교체)
const periodLabel = '최근 30일';

const kpiOrder = {
  depositWait: 206,
  newOrder: 57,
};
const kpiShipping = {
  toShip: 89,
  shipping: 40,
  delivered: 110,
  delayed: 4,
};
const kpiInquiry = {
  unanswered: 10,
  urgent: 4,
};
const kpiSettlement = {
  scheduled: 203,
  completed: 55,
};
const kpiClaim = {
  cancel: 22,
  return: 5,
  exchange: 2,
};

const requests = [
  { label: '주문확인 필요', count: 57, to: '/order/new' },
  { label: '발송처리 필요', count: 9, to: '/shipping/pending' },
  { label: '발송지연', count: 4, to: '/shipping/list' },
  { label: '반품지연', count: 0, to: '/order/claim' },
  { label: '교환지연', count: 0, to: '/order/claim' },
];

const notices = [
  { id: 1, type: '중요', title: '정산 일정 변경 안내', date: '2024-02-05' },
  { id: 2, type: '일반', title: '배송 시스템 점검 안내', date: '2024-02-04' },
  { id: 3, type: '이벤트', title: '2월 스토어 연동 이벤트', date: '2024-02-03' },
];

const salesChartData = [
  { label: '2/1', amount: 1850000, count: 42 },
  { label: '2/2', amount: 2100000, count: 48 },
  { label: '2/3', amount: 1680000, count: 38 },
  { label: '2/4', amount: 2450000, count: 55 },
  { label: '2/5', amount: 1980000, count: 44 },
  { label: '2/6', amount: 2431500, count: 52 },
];
const salesTotal = salesChartData.reduce((s, d) => s + d.amount, 0);
const salesCompare = '+0.3%'; // 전주 대비

const recentOrders = [
  {
    id: 'ORD-2024-001',
    store: '스마트스토어',
    amount: 45000,
    status: '출고대기',
    date: '2024-02-06 14:32',
  },
  { id: 'ORD-2024-002', store: '쿠팡', amount: 32000, status: '배송중', date: '2024-02-06 13:15' },
  {
    id: 'ORD-2024-003',
    store: '11번가',
    amount: 78000,
    status: '신규주문',
    date: '2024-02-06 12:48',
  },
  {
    id: 'ORD-2024-004',
    store: '스마트스토어',
    amount: 25600,
    status: '배송완료',
    date: '2024-02-06 11:20',
  },
  {
    id: 'ORD-2024-005',
    store: 'G마켓',
    amount: 125000,
    status: '출고대기',
    date: '2024-02-06 10:05',
  },
];

const recentClaims = [
  {
    id: 'CLM-001',
    orderId: 'ORD-2024-101',
    type: '취소',
    amount: 35000,
    status: '요청접수',
    date: '2024-02-06 13:20',
  },
  {
    id: 'CLM-002',
    orderId: 'ORD-2024-098',
    type: '반품',
    amount: 52000,
    status: '처리중',
    date: '2024-02-06 11:45',
  },
  {
    id: 'CLM-003',
    orderId: 'ORD-2024-095',
    type: '교환',
    amount: 28000,
    status: '요청접수',
    date: '2024-02-06 10:10',
  },
  {
    id: 'CLM-004',
    orderId: 'ORD-2024-090',
    type: '취소',
    amount: 67000,
    status: '처리완료',
    date: '2024-02-05 16:30',
  },
  {
    id: 'CLM-005',
    orderId: 'ORD-2024-088',
    type: '반품',
    amount: 41000,
    status: '처리중',
    date: '2024-02-05 14:00',
  },
];

const quickMenus = [
  { label: '신규 주문 처리', to: '/order/new' },
  { label: '발송처리 필요', to: '/shipping/pending' },
  { label: '취소·반품·교환', to: '/order/claim' },
  { label: '상품 등록', to: '/product/register' },
  { label: '문의 답변', to: '/customer/inquiry' },
  { label: '정산 내역', to: '/sales/settlement' },
  { label: '매출 현황', to: '/sales/status' },
];

export default function Dashboard() {
  const maxAmount = Math.max(...salesChartData.map((d) => d.amount));

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>대시보드</h1>
        <p className="dashboard-desc">판매 현황과 처리 현황을 한눈에 확인하세요.</p>
      </header>

      {/* 주문 · 배송 · 문의 · 정산 */}
      <section className="dashboard-kpi" aria-label="주문, 배송, 문의, 정산">
        <div className="kpi-card">
          <h3 className="kpi-title">주문</h3>
          <span className="kpi-period">{periodLabel}</span>
          <ul className="kpi-list">
            <li>
              <span className="kpi-item-label">입금대기</span>
              <strong>{kpiOrder.depositWait}건</strong>
            </li>
            <li>
              <span className="kpi-item-label">신규주문</span>
              <strong>{kpiOrder.newOrder}건</strong>
            </li>
          </ul>
          <Link to="/order/new" className="kpi-link">
            주문 처리
          </Link>
        </div>
        <div className="kpi-card">
          <h3 className="kpi-title">배송</h3>
          <span className="kpi-period">{periodLabel}</span>
          <ul className="kpi-list">
            <li>
              <span className="kpi-item-label">발송예정</span>
              <strong>{kpiShipping.toShip}건</strong>
            </li>
            <li>
              <span className="kpi-item-label">배송중</span>
              <strong>{kpiShipping.shipping}건</strong>
            </li>
            <li>
              <span className="kpi-item-label">배송완료</span>
              <strong>{kpiShipping.delivered}건</strong>
            </li>
            <li>
              <span className="kpi-item-label">배송지연</span>
              <strong>{kpiShipping.delayed}건</strong>
            </li>
          </ul>
          <Link to="/shipping/list" className="kpi-link">
            배송 목록
          </Link>
        </div>
        <div className="kpi-card">
          <h3 className="kpi-title">문의</h3>
          <span className="kpi-period">{periodLabel}</span>
          <ul className="kpi-list">
            <li>
              <span className="kpi-item-label">미답변 문의</span>
              <strong>{kpiInquiry.unanswered}건</strong>
            </li>
            <li>
              <span className="kpi-item-label">긴급메시지</span>
              <strong>{kpiInquiry.urgent}건</strong>
            </li>
          </ul>
          <Link to="/customer/inquiry" className="kpi-link">
            문의 관리
          </Link>
        </div>
        <div className="kpi-card">
          <h3 className="kpi-title">정산</h3>
          <span className="kpi-period">{periodLabel}</span>
          <ul className="kpi-list">
            <li>
              <span className="kpi-item-label">정산예정</span>
              <strong>{kpiSettlement.scheduled}건</strong>
            </li>
            <li>
              <span className="kpi-item-label">정산완료</span>
              <strong>{kpiSettlement.completed}건</strong>
            </li>
          </ul>
          <Link to="/sales/settlement" className="kpi-link">
            정산내역 보기
          </Link>
        </div>
        <div className="kpi-card">
          <h3 className="kpi-title">취소·반품·교환</h3>
          <span className="kpi-period">{periodLabel}</span>
          <ul className="kpi-list">
            <li>
              <span className="kpi-item-label">취소요청</span>
              <strong>{kpiClaim.cancel}건</strong>
            </li>
            <li>
              <span className="kpi-item-label">반품요청</span>
              <strong>{kpiClaim.return}건</strong>
            </li>
            <li>
              <span className="kpi-item-label">교환요청</span>
              <strong>{kpiClaim.exchange}건</strong>
            </li>
          </ul>
          <Link to="/order/claim" className="kpi-link">
            취소·반품·교환 처리
          </Link>
        </div>
      </section>

      {/* 요청 · 공지사항 */}
      <section className="dashboard-row dashboard-row--two">
        <div className="dashboard-card dashboard-card--request">
          <h2 className="card-heading">빠른 처리가 필요한 주문</h2>
          <ul className="request-list">
            {requests.map((r) => (
              <li key={r.label}>
                <Link to={r.to} className="request-item">
                  <span className="request-label">{r.label}</span>
                  <span className="request-count">{r.count}건</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="dashboard-card dashboard-card--notice">
          <h2 className="card-heading">공지사항</h2>
          <ul className="notice-list">
            {notices.map((n) => (
              <li key={n.id} className="notice-item">
                <span className="notice-type">{n.type}</span>
                <Link to="#" className="notice-title">
                  {n.title}
                </Link>
                <span className="notice-date">{n.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 판매현황 그래프 */}
      <section className="dashboard-card dashboard-card--chart">
        <div className="chart-header">
          <h2 className="card-heading">최근 7일 판매현황</h2>
          <div className="chart-summary">
            <span className="chart-total">₩{salesTotal.toLocaleString()}</span>
            <span className="chart-compare">전주 대비 {salesCompare}</span>
          </div>
        </div>
        <div className="chart-bars">
          {salesChartData.map((d) => (
            <div key={d.label} className="chart-bar-group">
              <div
                className="chart-bar"
                style={{ '--h': (d.amount / maxAmount) * 100 }}
                title={`${d.label} ₩${d.amount.toLocaleString()}`}
              />
              <span className="chart-label">{d.label}</span>
              <span className="chart-value">₩{(d.amount / 10000).toFixed(0)}만</span>
            </div>
          ))}
        </div>
      </section>

      {/* 최근 주문 · 빠른 메뉴 */}
      <section className="dashboard-row dashboard-row--two">
        <div className="dashboard-card">
          <div className="card-heading-row">
            <h2 className="card-heading">최근 주문</h2>
            <Link to="/order/list" className="card-link">
              전체 보기
            </Link>
          </div>
          <div className="table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>주문번호</th>
                  <th>스토어</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th>주문일시</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link to={`/order/${order.id}`} className="table-link">
                        {order.id}
                      </Link>
                    </td>
                    <td>{order.store}</td>
                    <td>₩{order.amount.toLocaleString()}</td>
                    <td>
                      <span className={`status status-${order.status.replace(/\s/g, '')}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="dashboard-card dashboard-card--quick">
          <h2 className="card-heading">빠른 메뉴</h2>
          <ul className="quick-menu">
            {quickMenus.map((m) => (
              <li key={m.label}>
                <Link to={m.to}>{m.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 최근 취소·반품·교환 */}
      <section className="dashboard-card">
        <div className="card-heading-row">
          <h2 className="card-heading">최근 취소·반품·교환</h2>
          <Link to="/order/claim" className="card-link">
            전체 보기
          </Link>
        </div>
        <div className="table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>클레임번호</th>
                <th>주문번호</th>
                <th>유형</th>
                <th>금액</th>
                <th>상태</th>
                <th>신청일시</th>
              </tr>
            </thead>
            <tbody>
              {recentClaims.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link to={`/order/claim?id=${c.id}`} className="table-link">
                      {c.id}
                    </Link>
                  </td>
                  <td>
                    <Link to={`/order/${c.orderId}`} className="table-link">
                      {c.orderId}
                    </Link>
                  </td>
                  <td>
                    <span className={`status status-claim status-claim-${c.type}`}>{c.type}</span>
                  </td>
                  <td>₩{c.amount.toLocaleString()}</td>
                  <td>{c.status}</td>
                  <td>{c.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
