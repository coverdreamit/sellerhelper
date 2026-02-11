'use client';

import { useState } from 'react';

/** 데모용 스토어 유형 옵션 (나중에 제거) */
const STORE_TYPE_OPTIONS = [
  { value: 'OPEN_MARKET', label: '오픈마켓' },
  { value: 'SOCIAL', label: '소셜커머스' },
  { value: 'ETC', label: '기타' },
];

export default function StoreAddModal({ onAdd, onClose }) {
  const [storeCode, setStoreCode] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeType, setStoreType] = useState('OPEN_MARKET');
  const [apiRequired, setApiRequired] = useState(true);
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = storeCode.trim().toUpperCase() || 'CUSTOM';
    const name = storeName.trim() || `스토어_${code}`;
    onAdd({
      storeCode: code,
      storeName: name,
      storeType,
      apiRequired,
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>스토어 추가</h2>
        <p className="modal-desc">
          연동할 인터넷쇼핑몰(스토어) 정보를 입력하세요. (데모: 임시 데이터)
        </p>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-row">
            <label className="required">스토어 코드</label>
            <input
              type="text"
              placeholder="예: 11ST, GMARKET (영문/숫자)"
              value={storeCode}
              onChange={(e) => setStoreCode(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label className="required">스토어명</label>
            <input
              type="text"
              placeholder="예: 11번가, G마켓"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
            />
          </div>
          <div className="form-row">
            <label>스토어 유형</label>
            <select
              value={storeType}
              onChange={(e) => setStoreType(e.target.value)}
            >
              {STORE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label>API 연동 필요</label>
            <label className="form-check">
              <input
                type="checkbox"
                checked={apiRequired}
                onChange={(e) => setApiRequired(e.target.checked)}
              />
              <span>예 (API 키 등 필요)</span>
            </label>
          </div>
          <div className="form-row">
            <label>설명</label>
            <input
              type="text"
              placeholder="선택 입력"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">
              추가
            </button>
            <button type="button" className="btn" onClick={onClose}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
