'use client';

import { useState } from 'react';
import '../../../styles/Settings.css';

// 데모 데이터: 그룹별 코드
const DEMO_GROUPS = {
  common: {
    label: '공통 코드',
    desc: '결제수단, 문의유형 등 공통으로 사용하는 코드를 관리합니다.',
    items: [
      { groupCode: 'PAY_METHOD', groupName: '결제수단', code: 'CARD', name: '카드', sortOrder: 1, useYn: 'Y' },
      { groupCode: 'PAY_METHOD', groupName: '결제수단', code: 'BANK', name: '무통장입금', sortOrder: 2, useYn: 'Y' },
      { groupCode: 'PAY_METHOD', groupName: '결제수단', code: 'MOBILE', name: '휴대폰', sortOrder: 3, useYn: 'Y' },
      { groupCode: 'INQUIRY_TYPE', groupName: '문의유형', code: 'PRODUCT', name: '상품문의', sortOrder: 1, useYn: 'Y' },
      { groupCode: 'INQUIRY_TYPE', groupName: '문의유형', code: 'DELIVERY', name: '배송문의', sortOrder: 2, useYn: 'Y' },
    ],
    hasGroup: true,
  },
  order: {
    label: '주문 상태 코드',
    desc: '주문 진행 단계별 상태 코드를 관리합니다.',
    items: [
      { code: 'NEW', name: '신규주문', desc: '결제 완료, 미처리', sortOrder: 1, useYn: 'Y' },
      { code: 'CONFIRM', name: '주문확인', desc: '주문 확인 완료', sortOrder: 2, useYn: 'Y' },
      { code: 'PREPARE', name: '상품준비중', desc: '출고 준비 중', sortOrder: 3, useYn: 'Y' },
      { code: 'SHIPPED', name: '배송중', desc: '배송 진행 중', sortOrder: 4, useYn: 'Y' },
      { code: 'DELIVERED', name: '배송완료', desc: '수령 완료', sortOrder: 5, useYn: 'Y' },
      { code: 'CANCEL', name: '취소', desc: '주문 취소', sortOrder: 6, useYn: 'Y' },
      { code: 'RETURN', name: '반품', desc: '반품 처리', sortOrder: 7, useYn: 'Y' },
      { code: 'EXCHANGE', name: '교환', desc: '교환 처리', sortOrder: 8, useYn: 'Y' },
    ],
    hasGroup: false,
  },
  shipping: {
    label: '배송 상태 코드',
    desc: '배송 진행 단계별 상태 코드를 관리합니다.',
    items: [
      { code: 'PENDING', name: '출고대기', desc: '출고 대기 중', sortOrder: 1, useYn: 'Y' },
      { code: 'PICKING', name: '상품픽킹', desc: '상품 준비 중', sortOrder: 2, useYn: 'Y' },
      { code: 'SHIPPED', name: '배송중', desc: '배송 진행 중', sortOrder: 3, useYn: 'Y' },
      { code: 'DELIVERED', name: '배송완료', desc: '수령 완료', sortOrder: 4, useYn: 'Y' },
      { code: 'FAILED', name: '배송실패', desc: '수령 불가 등', sortOrder: 5, useYn: 'Y' },
    ],
    hasGroup: false,
  },
  etc: {
    label: '기타 관리 코드',
    desc: '클레임 유형, 택배사 등 기타 공통 코드를 관리합니다.',
    items: [
      { groupCode: 'CLAIM_TYPE', groupName: '클레임 유형', code: 'CANCEL', name: '취소', sortOrder: 1, useYn: 'Y' },
      { groupCode: 'CLAIM_TYPE', groupName: '클레임 유형', code: 'RETURN', name: '반품', sortOrder: 2, useYn: 'Y' },
      { groupCode: 'CLAIM_TYPE', groupName: '클레임 유형', code: 'EXCHANGE', name: '교환', sortOrder: 3, useYn: 'Y' },
      { groupCode: 'CARRIER', groupName: '택배사', code: 'CJ', name: 'CJ대한통운', sortOrder: 1, useYn: 'Y' },
      { groupCode: 'CARRIER', groupName: '택배사', code: 'HANJIN', name: '한진택배', sortOrder: 2, useYn: 'Y' },
    ],
    hasGroup: true,
  },
};

const TABS = [
  { key: 'common', label: '공통 코드' },
  { key: 'order', label: '주문 상태' },
  { key: 'shipping', label: '배송 상태' },
  { key: 'etc', label: '기타 코드' },
];

export default function CodeManage() {
  const [activeTab, setActiveTab] = useState('common');

  const group = DEMO_GROUPS[activeTab];

  return (
    <div className="settings-page">
      <h1>코드 관리</h1>
      <p className="page-desc">시스템에서 사용하는 공통 코드를 그룹별로 관리합니다.</p>

      <div className="settings-section" style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, borderBottom: '1px solid #e5e7eb', paddingBottom: 8 }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`btn ${activeTab === tab.key ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab(tab.key)}
              style={{
                border: activeTab === tab.key ? 'none' : '1px solid #d1d5db',
                borderRadius: 6,
                padding: '8px 16px',
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <h2 style={{ fontSize: 16, marginBottom: 8 }}>{group.label}</h2>
        <p className="page-desc" style={{ marginBottom: 16 }}>{group.desc}</p>

        <div className="settings-toolbar">
          <div>
            {group.hasGroup && (
              <select style={{ padding: '6px 12px', marginRight: 8 }}>
                <option value="">전체 그룹</option>
                {[...new Set(group.items.map((i) => i.groupCode))].map((gc: string) => {
                  const first = group.items.find((i) => i.groupCode === gc);
                  return (
                    <option key={gc} value={gc}>
                      {first?.groupName || gc}
                    </option>
                  );
                })}
              </select>
            )}
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
            {group.hasGroup ? '코드 추가' : '상태 추가'}
          </button>
        </div>

        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                {group.hasGroup && (
                  <>
                    <th>그룹코드</th>
                    <th>그룹명</th>
                  </>
                )}
                <th>코드</th>
                <th>{group.hasGroup ? '코드명' : '상태명'}</th>
                {!group.hasGroup && <th>설명</th>}
                <th>정렬순서</th>
                <th>사용여부</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {group.items.map((item, i) => (
                <tr key={group.hasGroup ? `${item.groupCode}-${item.code}-${i}` : item.code}>
                  {group.hasGroup && (
                    <>
                      <td>{item.groupCode}</td>
                      <td>{item.groupName}</td>
                    </>
                  )}
                  <td>{item.code}</td>
                  <td>{item.name}</td>
                  {!group.hasGroup && <td>{item.desc}</td>}
                  <td>{item.sortOrder}</td>
                  <td>
                    <span className={`badge badge-${item.useYn === 'Y' ? 'active' : 'inactive'}`}>
                      {item.useYn === 'Y' ? '사용' : '미사용'}
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
      </div>
    </div>
  );
}
