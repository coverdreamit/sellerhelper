'use client';

import { useState, useEffect } from 'react';
import '@/styles/Settings.css';

/**
 * @param {{ vendor: object | null }} props - null이면 등록, 객체면 수정
 * @param {() => void} props.onClose
 * @param {(data: object) => void} [props.onSave]
 */
export function SupplierEditModal({ vendor, onClose, onSave }) {
  const isEdit = !!vendor?.vendorId;
  const [vendorName, setVendorName] = useState('');
  const [bizNo, setBizNo] = useState('');
  const [managerName, setManagerName] = useState('');
  const [address, setAddress] = useState('');
  const [addressDetail, setAddressDetail] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [memo, setMemo] = useState('');
  const [useYn, setUseYn] = useState(true);

  useEffect(() => {
    if (vendor) {
      setVendorName(vendor.vendorName ?? '');
      setBizNo(vendor.bizNo ?? '');
      setManagerName(vendor.managerName ?? '');
      setAddress(vendor.address ?? '');
      setAddressDetail(vendor.addressDetail ?? '');
      setPhone(vendor.phone ?? '');
      setEmail(vendor.email ?? '');
      setMemo(vendor.memo ?? '');
      setUseYn(vendor.isActive ?? true);
    } else {
      setVendorName('');
      setBizNo('');
      setManagerName('');
      setAddress('');
      setAddressDetail('');
      setPhone('');
      setEmail('');
      setMemo('');
      setUseYn(true);
    }
  }, [vendor]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      vendorId: vendor?.vendorId,
      vendorName: vendorName.trim(),
      bizNo: bizNo.trim(),
      managerName: managerName.trim(),
      address: address.trim(),
      addressDetail: addressDetail.trim(),
      phone: phone.trim(),
      email: email.trim(),
      memo: memo.trim(),
      isActive: useYn,
    });
    onClose?.();
  };

  const checkboxId = `supplier-use-${vendor?.vendorId ?? 'new'}`;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>{isEdit ? '발주업체 수정' : '발주업체 등록'}</h2>
        <p className="modal-desc">
          {isEdit ? '발주 업체 정보를 수정합니다.' : '발주 업체 정보를 등록합니다.'}
        </p>

        <form className="settings-form" onSubmit={handleSubmit}>
          <section className="settings-section" style={{ marginBottom: 16, padding: 16 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>기본 정보</h3>
            <div className="form-row">
              <label className="required">업체명</label>
              <div>
                <input
                  type="text"
                  placeholder="업체(법인)명"
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <label className="required">사업자등록번호</label>
              <div>
                <input
                  type="text"
                  placeholder="000-00-00000"
                  value={bizNo}
                  onChange={(e) => setBizNo(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <label>대표자명</label>
              <div>
                <input
                  type="text"
                  placeholder="대표자 이름"
                  value={managerName}
                  onChange={(e) => setManagerName(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <label>주소</label>
              <div>
                <input
                  type="text"
                  placeholder="기본 주소"
                  style={{ width: '100%', marginBottom: 4 }}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                <input
                  type="text"
                  placeholder="상세 주소"
                  style={{ width: '100%' }}
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <label className="required">연락처</label>
              <div>
                <input
                  type="text"
                  placeholder="대표 전화번호"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <label>이메일</label>
              <div>
                <input
                  type="email"
                  placeholder="대표 이메일"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <label>비고</label>
              <div>
                <textarea
                  placeholder="메모 사항"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <label>사용 여부</label>
              <div className="form-check">
                <input
                  type="checkbox"
                  id={checkboxId}
                  checked={useYn}
                  onChange={(e) => setUseYn(e.target.checked)}
                />
                <label htmlFor={checkboxId}>사용</label>
              </div>
            </div>
          </section>
          <div className="settings-actions modal-actions">
            <button type="submit" className="btn btn-primary">
              저장
            </button>
            <button type="button" className="btn" onClick={onClose}>
              닫기
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
