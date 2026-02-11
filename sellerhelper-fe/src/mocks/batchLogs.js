/**
 * 스토어별 배치 실행 이력 mock (데모용)
 */
export const batchLogsMock = {
  NAVER: [
    { id: 1, executedAt: '2025-02-11T09:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 45 },
    { id: 2, executedAt: '2025-02-10T09:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 38 },
    { id: 3, executedAt: '2025-02-09T09:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 52 },
    { id: 4, executedAt: '2025-02-08T09:00:00', status: 'ERROR', message: 'API 타임아웃', count: 0 },
    { id: 5, executedAt: '2025-02-07T09:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 41 },
    { id: 6, executedAt: '2025-02-06T09:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 33 },
    { id: 7, executedAt: '2025-02-05T09:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 28 },
  ],
  COUPANG: [
    { id: 1, executedAt: '2025-02-11T21:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 120 },
    { id: 2, executedAt: '2025-02-11T20:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 95 },
    { id: 3, executedAt: '2025-02-11T19:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 88 },
    { id: 4, executedAt: '2025-02-11T18:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 112 },
    { id: 5, executedAt: '2025-02-11T17:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 76 },
    { id: 6, executedAt: '2025-02-11T16:00:00', status: 'ERROR', message: 'API 인증 토큰 만료', count: 0 },
    { id: 7, executedAt: '2025-02-11T15:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 98 },
    { id: 8, executedAt: '2025-02-11T14:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 85 },
    { id: 9, executedAt: '2025-02-11T13:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 92 },
    { id: 10, executedAt: '2025-02-11T12:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 67 },
    { id: 11, executedAt: '2025-02-11T11:00:00', status: 'SUCCESS', message: '주문·재고 동기화 완료', count: 54 },
  ],
};
