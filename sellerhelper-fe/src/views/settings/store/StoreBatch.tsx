'use client';

import { useState, useEffect } from 'react';
import { useStoreStore, useUserStoreStore, useBatchStore } from '@/stores';
import type { BatchConfig } from '@/stores/batchStore';
import BatchHistoryModal from '@/components/store/BatchHistoryModal';
import { batchConfigMock } from '@/mocks/batchConfig';
import { batchLogsMock } from '@/mocks/batchLogs';
import '@/styles/Settings.css';

const STORE_DISPLAY = { NAVER: '네이버', COUPANG: '쿠팡', KAKAO: '카카오' };
const getStoreDisplayName = (storeCode) => STORE_DISPLAY[storeCode] ?? storeCode;

const STATUS_LABEL = { IDLE: '대기중', RUNNING: '실행중', STOPPED: '중지됨', ERROR: '오류' };

const INTERVAL_OPTIONS = [
  { value: 30, label: '30분' },
  { value: 60, label: '1시간' },
  { value: 120, label: '2시간' },
  { value: 180, label: '3시간' },
];

const DEFAULT_CONFIG = {
  isEnabled: true,
  scheduleType: 'ONCE',
  executeAt: '09:00',
  startTime: '11:00',
  endTime: '22:00',
  intervalMinutes: 60,
  excludedTimes: [],
  nextRunAt: null,
};

const getBatchStatus = (config, storeCode) => {
  if (!config?.isEnabled) return 'STOPPED';
  return 'IDLE'; // 데모: RUNNING/ERROR는 실제 배치 시뮬레이션 필요
};

export default function StoreBatch() {
  const { stores } = useStoreStore();
  const { userStores } = useUserStoreStore();
  const { batchConfigs, batchLogs, setBatchConfig, initFromMock } = useBatchStore();

  const [historyStoreCode, setHistoryStoreCode] = useState(null);

  const connectedStores = stores.filter((s) => {
    const us = userStores.find((u) => u.storeCode === s.storeCode);
    return us?.authStatus === 'CONNECTED' && us?.isEnabled;
  });

  useEffect(() => {
    initFromMock(batchConfigMock.batchConfigs as BatchConfig[], batchLogsMock as Record<string, { id: number; executedAt: string; status: 'SUCCESS' | 'ERROR'; message: string; count: number }[]>);
  }, [initFromMock]);

  const getConfig = (storeCode) => {
    const c = batchConfigs[storeCode];
    if (!c) return { storeCode, ...DEFAULT_CONFIG };
    return { ...DEFAULT_CONFIG, ...c, storeCode };
  };

  const updateConfig = (storeCode, updates) => {
    const current = getConfig(storeCode);
    setBatchConfig(storeCode, { ...current, ...updates });
  };

  const toggleEnabled = (storeCode) => {
    const c = getConfig(storeCode);
    updateConfig(storeCode, { isEnabled: !c.isEnabled });
  };

  const addExcludedTime = (storeCode) => {
    const c = getConfig(storeCode);
    const list = [...(c.excludedTimes || []), { start: '12:00', end: '13:00' }];
    updateConfig(storeCode, { excludedTimes: list });
  };

  const removeExcludedTime = (storeCode, idx) => {
    const c = getConfig(storeCode);
    const list = (c.excludedTimes || []).filter((_, i) => i !== idx);
    updateConfig(storeCode, { excludedTimes: list });
  };

  const updateExcludedTime = (storeCode, idx, field, value) => {
    const c = getConfig(storeCode);
    const list = [...(c.excludedTimes || [])];
    if (!list[idx]) return;
    list[idx] = { ...list[idx], [field]: value };
    updateConfig(storeCode, { excludedTimes: list });
  };

  const handleSave = (storeCode) => {
    alert('배치 설정이 저장되었습니다.');
  };

  const formatNextRun = (nextRunAt) => {
    if (!nextRunAt) return '-';
    const d = new Date(nextRunAt);
    return d.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="settings-page settings-page--compact">
      <h1>배치 관리</h1>
      <p className="page-desc">
        스토어별 배치 실행 시간·간격을 설정하고, 배치 이력을 확인할 수 있습니다.
      </p>

      {connectedStores.length === 0 ? (
        <section className="settings-section">
          <p className="text-muted">연동된 스토어가 없습니다. 스토어 연동에서 스토어를 연결해 주세요.</p>
        </section>
      ) : (
        connectedStores.map((store) => {
          const config = getConfig(store.storeCode);
          const status = getBatchStatus(config, store.storeCode);
          const displayName = getStoreDisplayName(store.storeCode);

          return (
            <section key={store.storeCode} className="settings-section batch-card">
              <div className="batch-card-header">
                <h2>{displayName}</h2>
                <div className="batch-card-actions">
                  <button
                    type="button"
                    className="btn btn-sm"
                    onClick={() => setHistoryStoreCode(store.storeCode)}
                  >
                    배치이력
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${config.isEnabled ? 'btn-danger' : 'btn-primary'}`}
                    onClick={() => toggleEnabled(store.storeCode)}
                  >
                    {config.isEnabled ? '■ 중지' : '▶ 시작'}
                  </button>
                </div>
              </div>

              <div className="batch-card-row batch-card-status">
                <div className="batch-status-item">
                  <span className="batch-label">배치 상태</span>
                  <span className={`badge status-${status.toLowerCase()}`}>
                    {STATUS_LABEL[status]}
                  </span>
                </div>
                <div className="batch-status-item">
                  <span className="batch-label">다음 실행 예정</span>
                  <span className="batch-value">{formatNextRun(config.nextRunAt)}</span>
                </div>
              </div>

              <div className="batch-card-body">
                <div className="batch-form-row">
                  <label>배치 주기</label>
                  <div className="form-check-group form-check-group--inline">
                    <label className="form-check-item">
                      <input
                        type="radio"
                        name={`schedule-${store.storeCode}`}
                        checked={config.scheduleType === 'ONCE'}
                        onChange={() => updateConfig(store.storeCode, { scheduleType: 'ONCE' })}
                      />
                      <span>하루 한 번</span>
                    </label>
                    <label className="form-check-item">
                      <input
                        type="radio"
                        name={`schedule-${store.storeCode}`}
                        checked={config.scheduleType === 'INTERVAL'}
                        onChange={() => updateConfig(store.storeCode, { scheduleType: 'INTERVAL' })}
                      />
                      <span>지정 간격</span>
                    </label>
                  </div>
                </div>

                {config.scheduleType === 'ONCE' ? (
                  <div className="batch-form-row">
                    <label>실행 시각</label>
                    <div className="batch-time-row">
                      <input
                        type="time"
                        value={config.executeAt ?? '09:00'}
                        onChange={(e) =>
                          updateConfig(store.storeCode, { executeAt: e.target.value })
                        }
                      />
                      <span className="batch-time-desc">에 한 번만</span>
                    </div>
                  </div>
                ) : (
                  <div className="batch-form-row">
                    <label>실행 구간</label>
                    <div className="batch-inline-row">
                      <input
                        type="time"
                        value={config.startTime ?? '11:00'}
                        onChange={(e) =>
                          updateConfig(store.storeCode, { startTime: e.target.value })
                        }
                      />
                      <span className="batch-time-desc">~</span>
                      <select
                        value={config.intervalMinutes ?? 60}
                        onChange={(e) =>
                          updateConfig(store.storeCode, {
                            intervalMinutes: Number(e.target.value),
                          })
                        }
                      >
                        {INTERVAL_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}마다
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={config.endTime ?? '22:00'}
                        onChange={(e) =>
                          updateConfig(store.storeCode, { endTime: e.target.value })
                        }
                      />
                      <span className="batch-time-desc">까지</span>
                    </div>
                  </div>
                )}

                <div className="batch-form-row">
                  <label>제외 시간</label>
                  <div className="batch-excluded">
                    {(config.excludedTimes || []).length === 0 ? (
                      <span className="batch-excluded-empty">없음</span>
                    ) : (
                      (config.excludedTimes || []).map((ex, idx) => (
                        <div key={idx} className="batch-excluded-item">
                          <input
                            type="time"
                            value={ex.start}
                            onChange={(e) =>
                              updateExcludedTime(store.storeCode, idx, 'start', e.target.value)
                            }
                          />
                          <span>~</span>
                          <input
                            type="time"
                            value={ex.end}
                            onChange={(e) =>
                              updateExcludedTime(store.storeCode, idx, 'end', e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-remove"
                            onClick={() => removeExcludedTime(store.storeCode, idx)}
                          >
                            삭제
                          </button>
                        </div>
                      ))
                    )}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => addExcludedTime(store.storeCode)}
                    >
                      + 추가
                    </button>
                  </div>
                </div>

                <div className="batch-form-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSave(store.storeCode)}
                  >
                    저장
                  </button>
                </div>
              </div>
            </section>
          );
        })
      )}

      {historyStoreCode && (
        <BatchHistoryModal
          storeName={getStoreDisplayName(historyStoreCode)}
          storeCode={historyStoreCode}
          logs={batchLogs[historyStoreCode] ?? []}
          onClose={() => setHistoryStoreCode(null)}
        />
      )}
    </div>
  );
}
