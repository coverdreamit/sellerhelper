'use client';

import { useState, useEffect } from 'react';
import '@/styles/Settings.css';

const DEFAULT_POLICY = {
  autoOrder: {
    enabled: false,
    stockThreshold: 0,
    defaultOrderQty: 0,
    orderUnit: 'EA',
  },
  leadTime: {
    days: 0,
    includeWeekend: false,
  },
  orderLimit: {
    minOrderQty: 1,
    minOrderAmount: 0,
  },
  delivery: {
    shippingType: 'DIRECT',
    bundleAllowed: true,
  },
  schedule: {
    orderableDays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
    cutoffTime: '18:00',
  },
  useYn: 'Y',
  memo: '',
};

const ORDER_UNITS = [
  { value: 'EA', label: 'EA' },
  { value: 'BOX', label: 'BOX' },
  { value: 'SET', label: 'SET' },
];

const SHIPPING_TYPES = [
  { value: 'DIRECT', label: '직배송' },
  { value: 'WAREHOUSE', label: '창고입고' },
  { value: 'DROPSHIP', label: '위탁배송' },
];

const WEEKDAYS = [
  { value: 'MON', label: '월' },
  { value: 'TUE', label: '화' },
  { value: 'WED', label: '수' },
  { value: 'THU', label: '목' },
  { value: 'FRI', label: '금' },
  { value: 'SAT', label: '토' },
  { value: 'SUN', label: '일' },
];

export function SupplierPolicyModal({ vendor, onClose, onSave }) {
  const [policy, setPolicy] = useState(DEFAULT_POLICY);

  useEffect(() => {
    if (vendor?.policy) {
      setPolicy((prev) => ({ ...DEFAULT_POLICY, ...vendor.policy }));
    } else {
      setPolicy(DEFAULT_POLICY);
    }
  }, [vendor]);

  const update = (path, value) => {
    setPolicy((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];
        if (!(key in cur)) cur[key] = {};
        cur = cur[key];
      }
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.(vendor?.vendorId, policy);
    onClose?.();
  };

  if (!vendor) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
        <h2>발주 정책 설정 - {vendor.vendorName}</h2>
        <p className="modal-desc">이 업체에 적용되는 발주 조건을 설정합니다.</p>

        <form className="settings-form" onSubmit={handleSubmit}>
          <section className="settings-section" style={{ marginBottom: 16, padding: 16 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>자동 발주</h3>
            <div className="form-row">
              <label>자동 발주 사용</label>
              <div className="form-check">
                <input
                  type="checkbox"
                  checked={policy.autoOrder?.enabled ?? false}
                  onChange={(e) =>
                    update('autoOrder.enabled', e.target.checked)
                  }
                />
                <label>재고 부족 시 자동 발주</label>
              </div>
            </div>
            <div className="form-row">
              <label>재고 부족 기준</label>
              <input
                type="number"
                min={0}
                value={policy.autoOrder?.stockThreshold ?? 0}
                onChange={(e) =>
                  update('autoOrder.stockThreshold', Number(e.target.value) || 0)
                }
              />
            </div>
            <div className="form-row">
              <label>기본 발주 수량</label>
              <input
                type="number"
                min={0}
                value={policy.autoOrder?.defaultOrderQty ?? 0}
                onChange={(e) =>
                  update('autoOrder.defaultOrderQty', Number(e.target.value) || 0)
                }
              />
            </div>
            <div className="form-row">
              <label>발주 단위</label>
              <select
                value={policy.autoOrder?.orderUnit ?? 'EA'}
                onChange={(e) => update('autoOrder.orderUnit', e.target.value)}
              >
                {ORDER_UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="settings-section" style={{ marginBottom: 16, padding: 16 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>Lead Time / 제한</h3>
            <div className="form-row">
              <label>Lead Time (일)</label>
              <input
                type="number"
                min={0}
                max={30}
                value={policy.leadTime?.days ?? 0}
                onChange={(e) =>
                  update('leadTime.days', Number(e.target.value) || 0)
                }
              />
            </div>
            <div className="form-row">
              <label>주말 포함</label>
              <div className="form-check">
                <input
                  type="checkbox"
                  checked={policy.leadTime?.includeWeekend ?? false}
                  onChange={(e) =>
                    update('leadTime.includeWeekend', e.target.checked)
                  }
                />
                <label>주말 포함</label>
              </div>
            </div>
            <div className="form-row">
              <label>최소 발주 수량</label>
              <input
                type="number"
                min={0}
                value={policy.orderLimit?.minOrderQty ?? 1}
                onChange={(e) =>
                  update('orderLimit.minOrderQty', Number(e.target.value) || 0)
                }
              />
            </div>
            <div className="form-row">
              <label>최소 발주 금액 (원)</label>
              <input
                type="number"
                min={0}
                value={policy.orderLimit?.minOrderAmount ?? 0}
                onChange={(e) =>
                  update('orderLimit.minOrderAmount', Number(e.target.value) || 0)
                }
              />
            </div>
          </section>

          <section className="settings-section" style={{ marginBottom: 16, padding: 16 }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '1rem' }}>배송 / 일정</h3>
            <div className="form-row">
              <label>배송 유형</label>
              <select
                value={policy.delivery?.shippingType ?? 'DIRECT'}
                onChange={(e) => update('delivery.shippingType', e.target.value)}
              >
                {SHIPPING_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>묶음 배송 허용</label>
              <div className="form-check">
                <input
                  type="checkbox"
                  checked={policy.delivery?.bundleAllowed ?? true}
                  onChange={(e) =>
                    update('delivery.bundleAllowed', e.target.checked)
                  }
                />
                <label>허용</label>
              </div>
            </div>
            <div className="form-row">
              <label>발주 가능 요일</label>
              <div className="form-check-group" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {WEEKDAYS.map((d) => {
                  const days = policy.schedule?.orderableDays ?? ['MON', 'TUE', 'WED', 'THU', 'FRI'];
                  const checked = days.includes(d.value);
                  return (
                    <label key={d.value} className="form-check-item" style={{ margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...(days || []), d.value]
                            : (days || []).filter((x) => x !== d.value);
                          update('schedule.orderableDays', next.length ? next : []);
                        }}
                      />
                      <span>{d.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="form-row">
              <label>당일 발주 마감</label>
              <input
                type="text"
                placeholder="18:00"
                value={policy.schedule?.cutoffTime ?? ''}
                onChange={(e) => update('schedule.cutoffTime', e.target.value)}
              />
            </div>
          </section>

          <div className="form-row">
            <label>메모</label>
            <textarea
              placeholder="정책 메모"
              value={policy.memo ?? ''}
              onChange={(e) => update('memo', e.target.value)}
            />
          </div>

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
