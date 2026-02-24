'use client';

import { useState, useEffect } from 'react';
import { updateMyStore, verifyMyStore, type MyStoreItem, type StoreMyUpdateParams } from '@/services';
import '@/styles/Settings.css';

interface StoreEditModalProps {
  store: MyStoreItem;
  onClose: () => void;
  onSaved: () => void;
}

export default function StoreEditModal({ store, onClose, onSaved }: StoreEditModalProps) {
  const [name, setName] = useState(store.name);
  const [enabled, setEnabled] = useState(store.enabled);
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [apiKeyTouched, setApiKeyTouched] = useState(false);
  const [apiSecretTouched, setApiSecretTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(store.name);
    setEnabled(store.enabled);
  }, [store]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('스토어명을 입력하세요.');
      return;
    }
    setSaving(true);
    try {
      const params: StoreMyUpdateParams = {
        name: trimmedName,
        enabled,
      };
      const keyToSend = apiKey.trim();
      const secretToSend = apiSecret.trim();
      if ((keyToSend && keyToSend !== '••••••••') || (secretToSend && secretToSend !== '••••••••')) {
        if (keyToSend && keyToSend !== '••••••••') params.apiKey = keyToSend;
        if (secretToSend && secretToSend !== '••••••••') params.apiSecret = secretToSend;
      }
      await updateMyStore(store.uid, params);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '스토어 수정 실패');
    } finally {
      setSaving(false);
    }
  };

  const handleVerify = async () => {
    setError('');
    if (apiKey.trim() !== '' || apiSecret.trim() !== '') {
      setError('API 키를 변경한 경우 먼저 저장한 뒤 연동 테스트를 해주세요.');
      return;
    }
    setVerifying(true);
    try {
      await verifyMyStore(store.uid);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '연동 검증 실패');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>스토어 수정</h2>
        <p className="modal-desc">
          {store.mallName} - 스토어 정보를 수정합니다.
        </p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        <form className="settings-form" onSubmit={handleSubmit}>
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
            <label>사용 여부</label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              사용 (주문·상품 등에서 이 스토어가 표시됨)
            </label>
          </div>
          <div className="form-row">
            <div>
              <label>API Key / Client ID</label>
              {store.hasStoredCredentials && (
                <span className="form-hint" style={{ display: 'block' }}>(저장됨)</span>
              )}
            </div>
            <input
              type="text"
              placeholder={store.hasStoredCredentials ? undefined : '변경 시에만 입력 (비워두면 유지)'}
              value={
                store.hasStoredCredentials && apiKey === '' && !apiKeyTouched
                  ? '••••••••'
                  : apiKey
              }
              onFocus={() => store.hasStoredCredentials && !apiKey && setApiKeyTouched(true)}
              onBlur={() => apiKey === '' && setApiKeyTouched(false)}
              onChange={(e) => setApiKey(e.target.value)}
              maxLength={500}
            />
          </div>
          <div className="form-row">
            <div>
              <label>API Secret / Client Secret</label>
              {store.hasStoredCredentials && (
                <span className="form-hint" style={{ display: 'block' }}>(저장됨)</span>
              )}
            </div>
            <input
              type="password"
              placeholder={store.hasStoredCredentials ? undefined : '변경 시에만 입력 (비워두면 유지)'}
              value={
                store.hasStoredCredentials && apiSecret === '' && !apiSecretTouched
                  ? '••••••••'
                  : apiSecret
              }
              onFocus={() => store.hasStoredCredentials && !apiSecret && setApiSecretTouched(true)}
              onBlur={() => apiSecret === '' && setApiSecretTouched(false)}
              onChange={(e) => setApiSecret(e.target.value)}
              maxLength={500}
            />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary" disabled={saving || verifying}>
              {saving ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleVerify}
              disabled={saving || verifying}
              title="저장된 API 키로 실제 연동 검증"
            >
              {verifying ? '검증 중...' : '연동 테스트'}
            </button>
            <button type="button" className="btn" onClick={onClose} disabled={saving || verifying}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
