'use client';

import { useState } from 'react';
import '@/styles/Settings.css';

/** 환경설정 > 사용자 로그 - 발주이력, 가져오기 이력 (조회만) */
const mockOrderHistory = [
  { id: 1, date: '2025-02-19 14:30', supplier: 'OO발주', items: 3, status: '완료' },
  { id: 2, date: '2025-02-19 10:15', supplier: 'XX물산', items: 5, status: '완료' },
  { id: 3, date: '2025-02-18 16:20', supplier: 'OO발주', items: 2, status: '완료' },
];

const mockImportHistory = [
  {
    id: 1,
    date: '2025-02-19 15:00',
    target: '상품 목록',
    store: '스마트스토어',
    status: '성공',
    count: 12,
  },
  {
    id: 2,
    date: '2025-02-19 09:00',
    target: '주문 목록',
    store: '스마트스토어',
    status: '성공',
    count: 8,
  },
  {
    id: 3,
    date: '2025-02-18 18:00',
    target: '상품 목록',
    store: '쿠팡',
    status: '성공',
    count: 24,
  },
];

export default function UserLog() {
  const [tab, setTab] = useState('order');

  return (
    <div className="settings-page">
      <h1>사용자 로그</h1>
      <p className="page-desc">발주 이력과 가져오기 이력을 조회합니다. (조회 전용)</p>

      <section className="settings-section">
        <div className="user-log-tabs">
          <button
            type="button"
            className={`user-log-tab ${tab === 'order' ? 'active' : ''}`}
            onClick={() => setTab('order')}
          >
            발주이력
          </button>
          <button
            type="button"
            className={`user-log-tab ${tab === 'import' ? 'active' : ''}`}
            onClick={() => setTab('import')}
          >
            가져오기 이력
          </button>
        </div>

        {tab === 'order' && (
          <div className="settings-table-wrap">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>일시</th>
                  <th>발주업체</th>
                  <th>건수</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {mockOrderHistory.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.supplier}</td>
                    <td>{row.items}건</td>
                    <td>
                      <span
                        className={`badge badge-${row.status === '완료' ? 'active' : 'inactive'}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'import' && (
          <div className="settings-table-wrap">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>일시</th>
                  <th>대상</th>
                  <th>스토어</th>
                  <th>건수</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {mockImportHistory.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.target}</td>
                    <td>{row.store}</td>
                    <td>{row.count}건</td>
                    <td>
                      <span
                        className={`badge badge-${row.status === '성공' ? 'active' : 'inactive'}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
