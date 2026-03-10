'use client';

import { useEffect, useState } from 'react';
import { getApiBase } from '@/lib/api';

/**
 * 백엔드 /api/health 직접 호출 가능 여부 확인 (프록시 없음).
 * 연결 실패 시 상단에 안내 배너 표시.
 */
export default function BackendHealthBanner() {
  const [unreachable, setUnreachable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    const healthUrl = `${getApiBase()}/api/health`;

    fetch(healthUrl, { credentials: 'include', signal: controller.signal })
      .then((res) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        if (!res.ok) {
          setUnreachable(true);
          setErrorMessage(`HTTP ${res.status}`);
        } else {
          setUnreachable(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          clearTimeout(timeoutId);
          setUnreachable(true);
          if (err.name === 'AbortError') {
            setErrorMessage('연결 시간 초과(8초)');
          } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
            setErrorMessage('네트워크 오류(백엔드 미실행 또는 포트 불일치)');
          } else {
            setErrorMessage(err?.message ?? '연결 실패');
          }
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  const apiUrl = getApiBase();

  if (unreachable !== true || dismissed) return null;

  return (
    <div
      role="alert"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 9999,
        padding: '10px 16px',
        background: '#b91c1c',
        color: '#fff',
        fontSize: 14,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <span>
        백엔드 API에 연결할 수 없습니다.
        {errorMessage && <strong style={{ marginLeft: 6 }}>({errorMessage})</strong>}{' '}
        FE(5000)에서 BE <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px' }}>{apiUrl}</code> 로 직접 호출합니다 (프록시 없음).{' '}
        확인: <a href={`${apiUrl}/api/health`} target="_blank" rel="noopener noreferrer" style={{ color: '#fef08a' }}>백엔드 헬스 직접 열기</a>.{' '}
        <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px' }}>NEXT_PUBLIC_API_URL</code> 변경 후 빌드/재시작 필요.
      </span>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        style={{
          background: 'rgba(255,255,255,0.2)',
          border: 'none',
          color: '#fff',
          padding: '6px 10px',
          cursor: 'pointer',
          borderRadius: 4,
        }}
      >
        닫기
      </button>
    </div>
  );
}
