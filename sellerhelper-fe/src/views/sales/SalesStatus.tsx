'use client';
import { useState } from 'react';
import '../../styles/Settings.css';

const summary = [
  { label: '오늘 매출', value: 1842000, unit: '원' },
  { label: '이번 달 매출', value: 32450000, unit: '원' },
  { label: '오늘 주문', value: 24, unit: '건' },
  { label: '이번 달 주문', value: 412, unit: '건' },
];

const mockDaily = [
  { date: '2024-02-06', count: 24, amount: 1842000, claim: 2 },
  { date: '2024-02-05', count: 31, amount: 2560000, claim: 1 },
  { date: '2024-02-04', count: 28, amount: 2120000, claim: 0 },
];

const mockStoreSales = [
  { store: '스마트스토어', orderCount: 156, amount: 18420000, rate: 52 },
  { store: '쿠팡', orderCount: 98, amount: 11200000, rate: 32 },
  { store: '11번가', orderCount: 45, amount: 5230000, rate: 16 },
];

const mockPeriod = [
  { period: '2024-02', orderCount: 412, amount: 34850000 },
  { period: '2024-01', orderCount: 385, amount: 31200000 },
  { period: '2023-12', orderCount: 420, amount: 36500000 },
];

type TabType = 'daily' | 'store' | 'period';

export default function SalesStatus() {
  const [tab, setTab] = useState<TabType>('daily');

  const tabs: { key: TabType; label: string }[] = [
    { key: 'daily', label: '일별 요약' },
    { key: 'store', label: '스토어별' },
    { key: 'period', label: '기간별 통계' },
  ];

  const storeTotal = mockStoreSales.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="list-page">
      <h1>매출 현황</h1>
      <p className="page-desc">매출·주문 현황을 조회합니다. (일별·스토어별·기간별)</p>
      <section className="settings-section">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {summary.map((s) => (
            <div key={s.label} style={{ padding: 16, background: '#f8f9fa', borderRadius: 8 }}>
              <div style={{ fontSize: '0.9rem', color: '#666' }}>{s.label}</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                {s.unit === '원' ? `₩${Number(s.value).toLocaleString()}` : `${s.value}${s.unit}`}
              </div>
            </div>
          ))}
        </div>

        <div className="settings-toolbar" style={{ flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                className={`btn ${tab === t.key ? 'btn-primary' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {tab === 'daily' && (
              <>
                <input type="date" style={{ padding: '6px 12px' }} />
                <span>~</span>
                <input type="date" style={{ padding: '6px 12px' }} />
              </>
            )}
            {(tab === 'store' || tab === 'period') && (
              <>
                <input type="month" style={{ padding: '6px 12px' }} />
                {tab === 'period' && (
                  <>
                    <span>~</span>
                    <input type="month" style={{ padding: '6px 12px' }} />
                  </>
                )}
              </>
            )}
            <button type="button" className="btn">
              조회
            </button>
          </div>
        </div>

        <div className="settings-table-wrap">
          {tab === 'daily' && (
            <table className="settings-table">
              <thead>
                <tr>
                  <th>일자</th>
                  <th>주문건수</th>
                  <th>매출금액</th>
                  <th>취소/반품</th>
                </tr>
              </thead>
              <tbody>
                {mockDaily.map((r) => (
                  <tr key={r.date}>
                    <td>{r.date}</td>
                    <td>{r.count}건</td>
                    <td>₩{r.amount.toLocaleString()}</td>
                    <td>{r.claim}건</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 'store' && (
            <>
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>스토어</th>
                    <th>주문건수</th>
                    <th>매출금액</th>
                    <th>비중</th>
                  </tr>
                </thead>
                <tbody>
                  {mockStoreSales.map((s) => (
                    <tr key={s.store}>
                      <td>{s.store}</td>
                      <td>{s.orderCount}건</td>
                      <td>₩{s.amount.toLocaleString()}</td>
                      <td>{s.rate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ marginTop: 16, textAlign: 'right' }}>
                <strong>합계 ₩{storeTotal.toLocaleString()}</strong>
              </div>
            </>
          )}

          {tab === 'period' && (
            <table className="settings-table">
              <thead>
                <tr>
                  <th>기간</th>
                  <th>주문건수</th>
                  <th>매출금액</th>
                </tr>
              </thead>
              <tbody>
                {mockPeriod.map((r) => (
                  <tr key={r.period}>
                    <td>{r.period}</td>
                    <td>{r.orderCount}건</td>
                    <td>₩{r.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
