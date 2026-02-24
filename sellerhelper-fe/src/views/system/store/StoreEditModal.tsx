'use client';

import { useState, useEffect } from 'react';
import { updateSystemStore, type StoreItem, type CompanyItem, type StoreUpdateParams } from '@/services';
import '@/styles/Settings.css';

interface StoreEditModalProps {
  store: StoreItem | null;
  companies: CompanyItem[];
  onClose: () => void;
  onSaved: () => void;
}

export default function StoreEditModal({ store, companies, onClose, onSaved }: StoreEditModalProps) {
  const [companyUid, setCompanyUid] = useState<number | ''>('');
  const [name, setName] = useState('');
  const [mallSellerId, setMallSellerId] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (store) {
      setCompanyUid(store.companyUid ?? '');
      setName(store.name);
      setMallSellerId(store.mallSellerId ?? '');
      setEnabled(store.enabled);
    }
  }, [store]);

  if (!store) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const storeName = name.trim();
    if (!storeName) {
      setError('스토어명을 입력하세요.');
      return;
    }
    setSaving(true);
    try {
      const params: StoreUpdateParams = {
        name: storeName,
        mallSellerId: mallSellerId.trim() || undefined,
        enabled,
      };
      if (companyUid === '') {
        params.clearCompany = true;
      } else {
        params.companyUid = Number(companyUid);
      }
      await updateSystemStore(store.uid, params);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '수정 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>스토어 수정</h2>
        <p className="modal-desc">
          {store.mallName} - {store.name}
        </p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>플랫폼</label>
            <input
              type="text"
              value={store.mallName}
              readOnly
              className="form-input-readonly"
            />
          </div>
          <div className="form-row">
            <label>소속 회사</label>
            <select
              value={companyUid}
              onChange={(e) => setCompanyUid(e.target.value === '' ? '' : Number(e.target.value))}
            >
              <option value="">선택 안 함</option>
              {companies.map((c) => (
                <option key={c.uid} value={c.uid}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <label className="required">스토어명</label>
            <input
              type="text"
              placeholder="예: 홍길동 쿠팡"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="form-row">
            <label>쇼핑몰 셀러 ID</label>
            <input
              type="text"
              placeholder="예: seller_001 (선택)"
              value={mallSellerId}
              onChange={(e) => setMallSellerId(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="form-row">
            <label>사용 여부</label>
            <label className="form-check">
              <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
              <span>사용</span>
            </label>
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '저장 중...' : '저장'}
            </button>
            <button type="button" className="btn" onClick={onClose} disabled={saving}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
