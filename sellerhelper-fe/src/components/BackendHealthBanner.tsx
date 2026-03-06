'use client';

import { useEffect, useState } from 'react';

/**
 * 백엔드 /api/health 호출 가능 여부 확인.
 * 연결 실패 시 상단에 안내 배너 표시 (로컬 개발 시 백엔드 미실행 등 원인 파악용).
 */
export default function BackendHealthBanner() {
  const [unreachable, setUnreachable] = useState<boolean | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/health', { credentials: 'include' })
      .then((res) => {
        if (cancelled) return;
        setUnreachable(!res.ok);
      })
      .catch(() => {
        if (!cancelled) setUnreachable(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
        백엔드 API에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요 (기본 포트 5080).
        환경 변수 <code style={{ background: 'rgba(0,0,0,0.2)', padding: '2px 6px' }}>NEXT_PUBLIC_API_URL</code>과
        next.config.mjs 리라이트 설정을 확인하세요. 변경 후 개발 서버를 재시작하세요.
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
