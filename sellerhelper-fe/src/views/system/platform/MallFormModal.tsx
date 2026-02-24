'use client';

import { useState, useEffect } from 'react';
import {
  createMall,
  updateMall,
  type MallItem,
  type MallCreateParams,
  type MallUpdateParams,
} from '@/services';
import '@/styles/Settings.css';

interface MallFormModalProps {
  mall: MallItem | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function MallFormModal({ mall, onClose, onSaved }: MallFormModalProps) {
  const isEdit = !!mall;
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('');
  const [description, setDescription] = useState('');
  const [apiBaseUrl, setApiBaseUrl] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mall) {
      setCode(mall.code);
      setName(mall.name);
      setChannel(mall.channel ?? '');
      setDescription(mall.description ?? '');
      setApiBaseUrl(mall.apiBaseUrl ?? '');
      setEnabled(mall.enabled);
    } else {
      setCode('');
      setName('');
      setChannel('');
      setDescription('');
      setApiBaseUrl('');
      setEnabled(true);
    }
  }, [mall]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const trimmedName = name.trim();
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedName) {
      setError('플랫폼명을 입력하세요.');
      return;
    }
    if (!isEdit && !trimmedCode) {
      setError('플랫폼 코드를 입력하세요. (예: COUPANG, NAVER, 11ST)');
      return;
    }
    setSaving(true);
    try {
      if (isEdit && mall) {
        const params: MallUpdateParams = {
          name: trimmedName,
          channel: channel.trim() || undefined,
          description: description.trim() || undefined,
          apiBaseUrl: apiBaseUrl.trim() || undefined,
          enabled,
        };
        await updateMall(mall.uid, params);
      } else {
        const params: MallCreateParams = {
          code: trimmedCode,
          name: trimmedName,
          channel: channel.trim() || undefined,
          description: description.trim() || undefined,
          apiBaseUrl: apiBaseUrl.trim() || undefined,
          enabled,
        };
        await createMall(params);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>{isEdit ? '플랫폼 수정' : '플랫폼 추가'}</h2>
        <p className="modal-desc">
          쇼핑몰 플랫폼을 등록합니다. 코드는 productStoreTabs와 매핑되며 영문 대문자로 입력하세요.
          <br />
          (예: COUPANG, NAVER, 11ST, KAKAO, GMARKET, AUCTION)
        </p>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <form className="settings-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="required">플랫폼 코드</label>
            <input
              type="text"
              placeholder="COUPANG, NAVER, 11ST"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={isEdit}
              maxLength={50}
              style={isEdit ? { background: '#f3f4f6', color: '#6b7280' } : undefined}
            />
            {isEdit && <span className="form-hint">코드는 수정할 수 없습니다.</span>}
          </div>
          <div className="form-row">
            <label className="required">플랫폼명</label>
            <input
              type="text"
              placeholder="쿠팡, 네이버 스마트스토어, 11번가"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
              required
            />
          </div>
          <div className="form-row">
            <label>채널</label>
            <input
              type="text"
              placeholder="예: 이베이코리아, 네이버"
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              maxLength={100}
            />
          </div>
          <div className="form-row">
            <label>설명</label>
            <textarea
              placeholder="플랫폼 설명 (선택)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>
          <div className="form-row">
            <label>API 베이스 URL</label>
            <input
              type="text"
              placeholder="https://api.example.com"
              value={apiBaseUrl}
              onChange={(e) => setApiBaseUrl(e.target.value)}
              maxLength={255}
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
              사용 (셀러가 스토어 연동 시 목록에 표시)
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
