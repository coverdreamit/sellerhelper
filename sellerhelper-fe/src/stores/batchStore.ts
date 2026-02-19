import { create } from 'zustand';

export interface BatchConfig {
  storeCode: string;
  scheduleType?: 'ONCE' | 'INTERVAL';
  executeAt?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  intervalMinutes?: number | null;
  [key: string]: unknown;
}

interface BatchLog {
  id: number;
  executedAt: string;
  status: 'SUCCESS' | 'ERROR';
  message: string;
  count: number;
}

interface BatchState {
  batchConfigs: Record<string, BatchConfig>;
  batchLogs: Record<string, BatchLog[]>;
  setBatchConfig: (storeCode: string, config: BatchConfig) => void;
  setBatchLogs: (storeCode: string, logs: BatchLog[]) => void;
  initFromMock: (configs: BatchConfig[], logs: Record<string, BatchLog[]>) => void;
}

export const useBatchStore = create<BatchState>((set) => ({
  batchConfigs: {},
  batchLogs: {},

  setBatchConfig: (storeCode: string, config: BatchConfig) =>
    set((state) => ({
      batchConfigs: { ...state.batchConfigs, [storeCode]: config },
    })),

  setBatchLogs: (storeCode: string, logs: BatchLog[]) =>
    set((state) => ({
      batchLogs: { ...state.batchLogs, [storeCode]: logs },
    })),

  initFromMock: (configs: BatchConfig[], logs: Record<string, BatchLog[]>) =>
    set(() => {
      const batchConfigs: Record<string, BatchConfig> = {};
      (configs || []).forEach((c: BatchConfig) => {
        batchConfigs[c.storeCode] = c;
      });
      return { batchConfigs, batchLogs: logs || {} };
    }),
}));
