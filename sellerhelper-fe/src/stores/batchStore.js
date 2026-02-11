import { create } from 'zustand';

/**
 * 배치 설정 타입
 * @typedef {Object} BatchConfig
 * @property {string} storeCode
 * @property {'ONCE'|'INTERVAL'} scheduleType - ONCE: 한번만, INTERVAL: 주기적
 * @property {string|null} executeAt - ONCE일 때 실행 시각 (HH:mm)
 * @property {string|null} startTime - INTERVAL일 때 시작 시각 (HH:mm)
 * @property {string|null} endTime - INTERVAL일 때 종료 시각 (HH:mm)
 * @property {number|null} intervalMinutes - INTERVAL일 때 간격(분): 30, 60, 120 등
 */
/**
 * @typedef {Object} BatchLog
 * @property {number} id
 * @property {string} executedAt
 * @property {'SUCCESS'|'ERROR'} status
 * @property {string} message
 * @property {number} count
 */
export const useBatchStore = create((set) => ({
  batchConfigs: {},
  batchLogs: {},

  setBatchConfig: (storeCode, config) =>
    set((state) => ({
      batchConfigs: { ...state.batchConfigs, [storeCode]: config },
    })),

  setBatchLogs: (storeCode, logs) =>
    set((state) => ({
      batchLogs: { ...state.batchLogs, [storeCode]: logs },
    })),

  initFromMock: (configs, logs) =>
    set(() => {
      const batchConfigs = {};
      (configs || []).forEach((c) => {
        batchConfigs[c.storeCode] = c;
      });
      return { batchConfigs, batchLogs: logs || {} };
    }),
}));
