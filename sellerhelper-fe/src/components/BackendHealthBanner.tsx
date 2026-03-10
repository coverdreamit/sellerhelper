'use client';

import { useEffect, useState } from 'react';

/**
 * 백엔드 /api/health 호출 가능 여부 확인.
 * 연결 실패 시 상단에 안내 배너 표시 (로컬 개발 시 백엔드 미실행 등 원인 파악용).
 */
export default function BackendHealthBanner() {
  const [unreachable, setUnreachable] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    fetch('/api/health', { credentials: 'include', signal: controller.signal })
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

  const apiUrl = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5080') : '';

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
        프론트는 <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px' }}>localhost:5000</code>에서 /api 요청을{' '}
        <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px' }}>{apiUrl || 'http://localhost:5080'}</code>로 프록시합니다.{' '}
        확인: 브라우저에서 <a href={`${apiUrl || 'http://localhost:5080'}/api/health`} target="_blank" rel="noopener noreferrer" style={{ color: '#fef08a' }}>백엔드 헬스 직접 열기</a>.{' '}
        백엔드 실행: <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px' }}>sellerhelper-be</code>에서{' '}
        <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px' }}>SPRING_PROFILES_ACTIVE=local,local-h2 mvn spring-boot:run</code>.{' '}
        <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px' }}>NEXT_PUBLIC_API_URL</code> 변경 후 프론트 개발 서버를 반드시 재시작하세요.
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
