'use client';

import { useState } from 'react';
import '@/styles/Settings.css';

/** 운영자용: 시스템에서 허용하는 스토어(쇼핑몰) 등록·관리 */
const mockStores = [
  { id: 1, storeCode: 'COUPANG', storeName: '쿠팡', channel: '쿠팡', isActive: true },
  {
    id: 2,
    storeCode: 'NAVER',
    storeName: '네이버 스마트스토어',
    channel: '네이버',
    isActive: true,
  },
  { id: 3, storeCode: 'G MARKET', storeName: '지마켓', channel: '이베이코리아', isActive: true },
];

export default function StoreManage() {
  const [search, setSearch] = useState('');

  return (
    <div className="settings-page">
      <h1>스토어 관리</h1>
      <p className="page-desc">시스템에서 허용하는 스토어(쇼핑몰)를 등록·관리합니다.</p>

      <section className="settings-section">
        <div className="settings-toolbar">
          <div>
            <input
              type="text"
              placeholder="스토어명/코드 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ padding: '6px 12px', marginRight: 8 }}
            />
            <button type="button" className="btn">
              검색
            </button>
          </div>
          <button type="button" className="btn btn-primary">
            스토어 등록
          </button>
        </div>
        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>스토어 코드</th>
                <th>스토어명</th>
                <th>채널</th>
                <th>사용 여부</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {mockStores.map((s) => (
                <tr key={s.id}>
                  <td>{s.storeCode}</td>
                  <td>{s.storeName}</td>
                  <td>{s.channel}</td>
                  <td>
                    <span className={`badge badge-${s.isActive ? 'active' : 'inactive'}`}>
                      {s.isActive ? '사용' : '미사용'}
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
