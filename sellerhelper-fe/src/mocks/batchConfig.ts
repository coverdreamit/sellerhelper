/**
 * 스토어별 배치 설정 mock
 * isEnabled: 배치 시작/중지
 * excludedTimes: 제외 시간 [{start, end}]
 */
export const batchConfigMock = {
  batchConfigs: [
    {
      storeCode: 'NAVER',
      isEnabled: true,
      scheduleType: 'ONCE',
      executeAt: '09:00',
      startTime: null,
      endTime: null,
      intervalMinutes: null,
      excludedTimes: [],
      nextRunAt: '2025-02-12T09:00:00',
    },
    {
      storeCode: 'COUPANG',
      isEnabled: true,
      scheduleType: 'INTERVAL',
      executeAt: null,
      startTime: '11:00',
      endTime: '22:00',
      intervalMinutes: 60,
      excludedTimes: [{ start: '12:00', end: '13:00' }],
      nextRunAt: '2025-02-11T22:00:00',
    },
  ],
};
