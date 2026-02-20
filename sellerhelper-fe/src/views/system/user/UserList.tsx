'use client';

import { useState } from 'react';
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
    name: '박희운',
    loginId: 'kihihi81',
    email: 'kihihi81@gmail.com',
    role: '관리자',
    status: '활성',
    lastLogin: '2024-02-06 09:00',
  },
  {
    id: 3,
    name: '김판매',
    loginId: 'seller1',
    email: 'seller1@example.com',
    role: '셀러',
    status: '활성',
    lastLogin: '2024-02-05 18:30',
  },
  {
    id: 4,
    name: '이주문',
    loginId: 'order1',
    email: 'order1@example.com',
    role: '주문담당',
    status: '활성',
    lastLogin: '2024-02-06 08:15',
  },
];

const mockPendingApprovals = [
  {
    id: 101,
    name: '최신규',
    loginId: 'newuser01',
    email: 'newuser01@example.com',
    companyName: '(주)테스트셀러',
    requestedAt: '2024-02-06 14:30',
  },
  {
    id: 102,
    name: '정가입',
    loginId: 'join99',
    email: 'join99@company.co.kr',
    companyName: '파머스샵',
    requestedAt: '2024-02-06 11:22',
  },
  {
    id: 103,
    name: '한신청',
    loginId: 'apply123',
    email: 'apply123@gmail.com',
    companyName: '',
    requestedAt: '2024-02-05 16:45',
  },
];

export default function UserList() {
  const [pendingList, setPendingList] = useState(mockPendingApprovals);

  const handleApprove = (id: number) => {
    setPendingList((prev) => prev.filter((u) => u.id !== id));
    // TODO: API 호출 후 성공 시 목록에서 제거
  };

  const handleReject = (id: number) => {
    setPendingList((prev) => prev.filter((u) => u.id !== id));
    // TODO: API 호출 후 성공 시 목록에서 제거
  };

  return (
    <div className="settings-page">
      <h1>사용자 목록</h1>
      <p className="page-desc">시스템 사용자 계정을 조회·관리합니다.</p>

      {/* 회원 가입 승인 대기 */}
      {pendingList.length > 0 && (
        <section className="settings-section" style={{ marginBottom: 24 }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            회원 가입 승인 대기
            <span className="badge badge-warning">{pendingList.length}건</span>
          </h2>
          <p className="page-desc" style={{ margin: '0 0 16px 0', fontSize: '0.85rem' }}>
            회원가입을 신청한 사용자의 승인 또는 거절을 처리합니다.
          </p>
          <div className="settings-table-wrap">
            <table className="settings-table">
              <thead>
                <tr>
                  <th>이름</th>
                  <th>로그인 ID</th>
                  <th>이메일</th>
                  <th>회사명</th>
                  <th>신청일시</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {pendingList.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.loginId}</td>
                    <td>{u.email}</td>
                    <td>{u.companyName || '-'}</td>
                    <td>{u.requestedAt}</td>
                    <td className="cell-actions">
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => handleApprove(u.id)}
                        >
                          승인
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => handleReject(u.id)}
                        >
                          거절
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

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
