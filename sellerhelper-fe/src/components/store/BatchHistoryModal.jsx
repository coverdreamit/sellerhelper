'use client';

export default function BatchHistoryModal({ storeName, storeCode, logs = [], onClose }) {
  if (!storeCode) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className="modal modal-lg modal--compact" onClick={(e) => e.stopPropagation()} role="dialog">
        <h2>{storeName} 배치 이력</h2>
        <p className="modal-desc">배치 실행 로그를 확인할 수 있습니다.</p>

        <div className="settings-table-wrap">
          <table className="settings-table">
            <thead>
              <tr>
                <th>실행 일시</th>
                <th>상태</th>
                <th>결과</th>
                <th>처리 건수</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    배치 이력이 없습니다.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.executedAt).toLocaleString('ko-KR')}</td>
                    <td>
                      <span className={`badge status-${log.status.toLowerCase()}`}>
                        {log.status === 'SUCCESS' ? '성공' : '실패'}
                      </span>
                    </td>
                    <td>{log.message}</td>
                    <td>{log.count?.toLocaleString() ?? '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
