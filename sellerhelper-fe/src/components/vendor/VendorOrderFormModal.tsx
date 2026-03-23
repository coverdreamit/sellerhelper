'use client';

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_ORDER_EXPORT_COLUMN_KEYS } from '@/constants/orderExportFields';
import { DEFAULT_PURCHASE_ORDER_COLUMN_KEYS } from '@/constants/purchaseOrderExportFields';
import {
  createVendorOrderForm,
  updateVendorOrderForm,
  type VendorOrderFormDto,
} from '@/services/vendorOrderForm.service';
import type { Vendor } from '@/types';
import '@/styles/Settings.css';
import './VendorOrderFormModal.css';

export type VendorOrderFormModalMode = 'create' | 'edit';

export interface VendorOrderFormModalProps {
  open: boolean;
  mode: VendorOrderFormModalMode;
  vendors: Vendor[];
  editTarget: VendorOrderFormDto | null;
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

export default function VendorOrderFormModal({
  open,
  mode,
  vendors,
  editTarget,
  onClose,
  onSaved,
}: VendorOrderFormModalProps) {
  const [vendorId, setVendorId] = useState<number | ''>('');
  const [formName, setFormName] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && editTarget) {
      setVendorId(editTarget.vendorUid);
      setFormName(editTarget.formName);
      setActive(editTarget.active);
    } else {
      setVendorId('');
      setFormName('');
      setActive(true);
    }
  }, [open, mode, editTarget]);

  const handleSave = useCallback(async () => {
    const name = formName.trim();
    if (!name) {
      alert('발주서 이름을 입력하세요.');
      return;
    }
    if (mode === 'create' && vendorId === '') {
      alert('발주업체를 선택하세요.');
      return;
    }

    setSaving(true);
    try {
      let columnKeys = [...DEFAULT_ORDER_EXPORT_COLUMN_KEYS];
      let purchaseColumnKeys = [...DEFAULT_PURCHASE_ORDER_COLUMN_KEYS];
      if (mode === 'edit' && editTarget) {
        if (editTarget.columnKeys?.length) {
          columnKeys = [...editTarget.columnKeys];
        }
        if (editTarget.purchaseColumnKeys?.length) {
          purchaseColumnKeys = [...editTarget.purchaseColumnKeys];
        }
      }
      const payload = { formName: name, active, columnKeys, purchaseColumnKeys };
      if (mode === 'create') {
        await createVendorOrderForm(Number(vendorId), payload);
      } else if (editTarget) {
        await updateVendorOrderForm(editTarget.vendorUid, editTarget.formUid, payload);
      }
      await onSaved();
      onClose();
      alert(mode === 'create' ? '발주서가 등록되었습니다.' : '발주서가 저장되었습니다.');
    } catch (e) {
      alert(e instanceof Error ? e.message : '저장 실패');
    } finally {
      setSaving(false);
    }
  }, [formName, active, mode, vendorId, editTarget, onSaved, onClose]);

  if (!open) return null;

  const vendorLabel =
    mode === 'edit' && editTarget
      ? editTarget.vendorName
      : vendors.find((v) => v.vendorId === vendorId)?.vendorName;

  return (
    <div className="modal-backdrop" onClick={() => !saving && onClose()}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h2>{mode === 'create' ? '발주서 등록' : '발주서 수정'}</h2>
        <p className="modal-desc">
          발주업체와 이름·사용 여부만 설정합니다. 주문 목록 CSV 칼럼과 발주 라인 칼럼은{' '}
          <strong>내용 만들기</strong> 페이지에서 API로 불러온 그리드 헤더 체크박스로 고르고, CSV로
          내려받을 수 있습니다.
        </p>

        <div className="vendor-order-form-modal-body">
          {mode === 'edit' && editTarget ? (
            <div className="vendor-order-form-field">
              <span className="vendor-order-form-label">발주업체</span>
              <div className="vendor-order-form-readonly">{vendorLabel ?? '-'}</div>
            </div>
          ) : (
            <div className="vendor-order-form-field">
              <label className="vendor-order-form-label" htmlFor="vof-vendor">
                발주업체
              </label>
              <select
                id="vof-vendor"
                className="vendor-order-form-select"
                value={vendorId === '' ? '' : String(vendorId)}
                onChange={(e) => setVendorId(e.target.value ? Number(e.target.value) : '')}
              >
                <option value="">선택</option>
                {vendors.map((v) => (
                  <option key={v.vendorId} value={v.vendorId}>
                    {v.vendorName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="vendor-order-form-field">
            <label className="vendor-order-form-label" htmlFor="vof-name">
              발주서 이름
            </label>
            <input
              id="vof-name"
              type="text"
              className="vendor-order-form-input"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="예: A도매 발주용"
            />
          </div>

          <div className="vendor-order-form-field vendor-order-form-field--row">
            <label className="vendor-order-form-check">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
              />
              <span>이 발주서 양식 사용</span>
            </label>
          </div>
        </div>

        <div className="settings-actions modal-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={saving}
            onClick={() => void handleSave()}
          >
            {saving ? '저장 중…' : '저장'}
          </button>
          <button type="button" className="btn" disabled={saving} onClick={onClose}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
