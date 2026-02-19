'use client';

import { useState } from 'react';
import '../../../styles/Settings.css';

const COMPANY_DATA = {
  companyName: '주식회사 문장공',
  businessNo: '123-45-67890',
  representative: '서법군',
  businessType: '전자상거래 소매업(G47912)',
  phone: '011-1111-2222',
  email: 'sellerhelper@gmail.com',
  zipCode: '03907',
  address: '서울 서대문구 거북골로 154, 104동 1506호 (북가좌동,북가좌삼호아파트)',
};

function copyToClipboard(text) {
  return navigator.clipboard.writeText(text);
}

export default function CompanyInfo() {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = () => {
    copyToClipboard(COMPANY_DATA.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="settings-page">
      <h1>회사 / 셀러 정보</h1>
      <p className="page-desc">셀러 및 회사 기본 정보를 등록·수정합니다.</p>

      <div className="company-info-approval-badge">
        <span className="badge badge-inactive">수정 불가</span>
        <span className="company-info-approval-text">관리자 승인 필요</span>
      </div>

      <section className="settings-section">
        <h2>기본 정보</h2>
        <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-row">
            <label className="required">회사명</label>
            <div>
              <input
                type="text"
                value={COMPANY_DATA.companyName}
                readOnly
                disabled
                className="form-input-readonly"
              />
            </div>
          </div>
          <div className="form-row">
            <label>사업자등록번호</label>
            <div>
              <input
                type="text"
                value={COMPANY_DATA.businessNo}
                readOnly
                disabled
                className="form-input-readonly"
              />
            </div>
          </div>
          <div className="form-row">
            <label>대표자명</label>
            <div>
              <input
                type="text"
                value={COMPANY_DATA.representative}
                readOnly
                disabled
                className="form-input-readonly"
              />
            </div>
          </div>
          <div className="form-row">
            <label>업태 / 업종</label>
            <div>
              <input
                type="text"
                value={COMPANY_DATA.businessType}
                readOnly
                disabled
                className="form-input-readonly"
              />
            </div>
          </div>
          <div className="form-row">
            <label>우편번호</label>
            <div>
              <input
                type="text"
                value={COMPANY_DATA.zipCode}
                readOnly
                disabled
                className="form-input-readonly"
              />
            </div>
          </div>
          <div className="form-row">
            <label className="required">주소</label>
            <div className="company-info-address-wrap">
              <input
                type="text"
                value={COMPANY_DATA.address}
                readOnly
                disabled
                className="form-input-readonly company-info-address"
              />
              <button
                type="button"
                className="btn btn-outline company-info-copy-btn"
                onClick={handleCopyAddress}
              >
                {copied ? '복사됨' : '복사하기'}
              </button>
            </div>
          </div>
          <div className="form-row">
            <label>연락처</label>
            <div>
              <input
                type="text"
                value={COMPANY_DATA.phone}
                readOnly
                disabled
                className="form-input-readonly"
              />
            </div>
          </div>
          <div className="form-row">
            <label>이메일</label>
            <div>
              <input
                type="email"
                value={COMPANY_DATA.email}
                readOnly
                disabled
                className="form-input-readonly"
              />
            </div>
          </div>
        </form>
      </section>
    </div>
  );
}
