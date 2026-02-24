'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchMalls, connectMyStore, verifyMyStore, type MallItem, type StoreConnectParams } from '@/services';
import { useAuthStore } from '@/stores';
import '@/styles/Settings.css';

interface StoreConnectModalProps {
  onClose: () => void;
  onConnected: () => void;
}

export default function StoreConnectModal({ onClose, onConnected }: StoreConnectModalProps) {
  const { user } = useAuthStore();
  const canManagePlatform = user?.menuKeys?.includes('system-platform');
  const [malls, setMalls] = useState<MallItem[]>([]);
  const [mallUid, setMallUid] = useState<number>(0);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const list = await fetchMalls(true);
        if (!cancelled && list.length > 0) {
          setMalls(list);
          setMallUid(list[0].uid);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : '플랫폼 목록 조회 실패');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const storeName = name.trim();
    if (!storeName) {
      setError('스토어명을 입력하세요.');
      return;
    }
    if (!mallUid) {
      setError('플랫폼을 선택하세요.');
      return;
    }
    setSaving(true);
    try {
      const params: StoreConnectParams = {
        mallUid,
        name: storeName,
        apiKey: apiKey.trim() || undefined,
        apiSecret: apiSecret.trim() || undefined,
      };
      const created = await connectMyStore(params);
      if (apiKey.trim() || apiSecret.trim()) {
        try {
          await verifyMyStore(created.uid);
        } catch {
          setError('스토어가 추가되었으나 연동 검증에 실패했습니다. 수정에서 연동 테스트를 다시 시도해 주세요.');
          setSaving(false);
          return;
        }
      }
      onConnected();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '연동 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>스토어 연동 추가</h2>
        <p className="modal-desc">
          연동할 플랫폼을 선택하고 스토어 정보 및 API 키를 입력하세요.
        </p>

        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}

        {loading ? (
          <p>플랫폼 목록 로딩 중...</p>
        ) : malls.length === 0 ? (
          <p>
            사용 가능한 플랫폼이 없습니다.
            {canManagePlatform ? (
              <>
                {' '}
                <Link href="/system/platform" className="link-inline" onClick={() => onClose()}>
                  플랫폼 관리
                </Link>
                에서 플랫폼을 추가하세요.
              </>
            ) : (
              ' 관리자에게 문의하세요.'
            )}
          </p>
        ) : (
          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <label className="required">플랫폼</label>
              <select
                value={mallUid || ''}
                onChange={(e) => setMallUid(Number(e.target.value))}
                required
              >
                <option value="">선택</option>
                {malls.map((m) => (
                  <option key={m.uid} value={m.uid}>
                    {m.name} ({m.code})
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
              <label>API Key / Client ID</label>
              <input
                type="text"
                placeholder="API Key 또는 Client ID (해당 시)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="form-row">
              <label>API Secret / Client Secret</label>
              <input
                type="password"
                placeholder="API Secret 또는 Client Secret (해당 시)"
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                maxLength={500}
              />
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '연동 중...' : '연동'}
              </button>
              <button type="button" className="btn" onClick={onClose} disabled={saving}>
                취소
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
