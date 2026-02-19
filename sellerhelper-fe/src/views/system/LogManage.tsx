'use client';

import { useState } from 'react';
import '@/styles/Settings.css';

/**
 * 시스템관리 > 로그 / 이력 관리
 * - 시스템 로그: 시스템 버그 이력
 * - 사용자 이력: 비밀번호 변경, 메일 발송, 가져오기 등 사용자 행위
 * - 운영자는 두 종류를 함께 조회 가능
 */
const mockSystemLogs = [
  {
    id: 1,
    date: '2025-02-19 15:32',
    level: 'ERROR',
    message: 'API 타임아웃 - 주문 조회 실패',
    detail: 'Connection timeout after 30s',
  },
  {
    id: 2,
    date: '2025-02-19 14:10',
    level: 'WARN',
    message: '재고 동기화 지연',
    detail: 'Retry count: 3',
  },
  {
    id: 3,
    date: '2025-02-18 23:45',
    level: 'ERROR',
    message: 'DB 연결 실패',
    detail: 'Pool exhausted',
  },
];

const mockUserLogs = [
  {
    id: 1,
    date: '2025-02-19 15:00',
    action: '가져오기',
    user: 'kihihi81',
    target: '상품 목록',
    result: '성공',
  },
  {
    id: 2,
    date: '2025-02-19 11:20',
    action: '메일 발송',
    user: 'system',
    target: '알림 메일',
    result: '성공',
  },
  {
    id: 3,
    date: '2025-02-19 09:15',
    action: '비밀번호 변경',
    user: 'hong',
    target: '-',
    result: '성공',
  },
];

export default function LogManage() {
  const [tab, setTab] = useState('system');

  return (
    <div className="settings-page">
      <h1>로그 / 이력 관리</h1>
      <p className="page-desc">
        시스템 버그 이력과 사용자 이력(비밀번호 변경, 메일 발송, 가져오기 등)을 함께 조회합니다.
      </p>

      <section className="settings-section">
        <div className="user-log-tabs">
          <button
            type="button"
            className={`user-log-tab ${tab === 'system' ? 'active' : ''}`}
            onClick={() => setTab('system')}
          >
            시스템 로그 (버그 이력)
          </button>
          <button
            type="button"
            className={`user-log-tab ${tab === 'user' ? 'active' : ''}`}
            onClick={() => setTab('user')}
          >
            사용자 이력
          </button>
        </div>

        {tab === 'system' && (
          <div className="settings-table-wrap">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>일시</th>
                  <th>수준</th>
                  <th>메시지</th>
                  <th>상세</th>
                </tr>
              </thead>
              <tbody>
                {mockSystemLogs.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>
                      <span
                        className={`badge badge-${row.level === 'ERROR' ? 'inactive' : 'active'}`}
                      >
                        {row.level}
                      </span>
                    </td>
                    <td>{row.message}</td>
                    <td>{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'user' && (
          <div className="settings-table-wrap">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>일시</th>
                  <th>행위</th>
                  <th>사용자</th>
                  <th>대상</th>
                  <th>결과</th>
                </tr>
              </thead>
              <tbody>
                {mockUserLogs.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.action}</td>
                    <td>{row.user}</td>
                    <td>{row.target}</td>
                    <td>
                      <span
                        className={`badge badge-${row.result === '성공' ? 'active' : 'inactive'}`}
                      >
                        {row.result}
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
