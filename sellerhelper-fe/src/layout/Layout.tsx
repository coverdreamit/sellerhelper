'use client';

import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { initAppData, useAuthStore } from '@/stores';
import { canAccessPath } from '@/config/menu';
import { getMe } from '@/services/auth.service';
import './Layout.css';

import { storage } from '@/shared/storage/storage';
import { STORAGE_KEYS } from '@/shared/storage/keys';

/** legacy cookies → localStorage 마이그레이션 후 제거 (Cookie 헤더 크기 절감) */
function migrateAndClearLegacyCookies() {
  if (typeof document === 'undefined') return;
  const migrateKeys: [string, string][] = [
    ['sidebar_collapsed', STORAGE_KEYS.SIDEBAR_COLLAPSED],
    ['menu_closed_keys', STORAGE_KEYS.MENU_CLOSED_KEYS],
  ];
  for (const [cookieKey, storageKey] of migrateKeys) {
    const m = document.cookie.match(new RegExp('(^| )' + cookieKey + '=([^;]+)'));
    if (m) {
      try {
        const val = decodeURIComponent(m[2]);
        storage.set(storageKey, val);
      } catch {
        /* ignore */
      }
    }
  }
  clearLegacyCookies();
}

/** 앱 최초 로딩 시 1회 실행 - 쿠키 제거로 Cookie 헤더 크기 축소 (배포 후 1~2주 유지) */
function clearLegacyCookies() {
  if (typeof document === 'undefined') return;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const name = cookie.split('=')[0].trim();
    if (name.startsWith('issueInfo') || name.startsWith('sellerhelper_') || name === 'sidebar_collapsed' || name === 'menu_closed_keys') {
      document.cookie = `${name}=; Max-Age=0; path=/`;
    }
  }
}

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser, logout: logoutStore, isLoggedIn } = useAuthStore();
  const isAuthPage = pathname?.startsWith('/login');
  const [mounted, setMounted] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    setMounted(true);
    migrateAndClearLegacyCookies();
  }, []);

  /** 사용자 정보(권한 포함) 갱신 - 새로고침·탭 복귀 시 최신 반영 */
  const refreshSession = useCallback(() => {
    getMe().then((me) => {
      setSessionChecked(true);
      if (me === undefined) return;
      if (me) {
        const currentToken = useAuthStore.getState().user?.token;
        setUser({ ...me, token: me.token ?? currentToken });
      } else {
        logoutStore();
      }
    });
  }, [setUser, logoutStore]);

  /** skipHydration 사용 → 수동 rehydrate 후 항상 refreshSession으로 백엔드 검증 (로컬 저장만 믿지 않음) */
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    void Promise.resolve(useAuthStore.persist.rehydrate()).then(() => {
      setTimeout(() => {
        // 토큰 유무와 관계없이 항상 getMe()로 검증. 연결 실패 시에는 로컬 세션 유지
        refreshSession();
      }, 0);
    });
  }, [mounted, refreshSession]);


  /** 탭으로 돌아왔을 때 권한 변경 반영 (새로고침 없이) */
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mounted) {
        refreshSession();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [mounted, refreshSession]);

  useEffect(() => {
    if (!mounted || !sessionChecked) return;
    if (isAuthPage && isLoggedIn()) {
      router.replace('/');
      return;
    }
    if (!isAuthPage && !isLoggedIn()) {
      router.replace('/login');
      return;
    }
    if (!isAuthPage && pathname && user) {
      const companyRequiredPath = '/settings/basic/company';
      const needsCompanyRegistration = user.companyUid == null;
      if (needsCompanyRegistration && pathname !== companyRequiredPath) {
        router.replace(companyRequiredPath);
        return;
      }
      if (!needsCompanyRegistration && !canAccessPath(pathname, user.menuKeys ?? [])) {
        router.replace('/');
        return;
      }
      initAppData();
    }
  }, [mounted, sessionChecked, isAuthPage, isLoggedIn, pathname, user, router]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = window.location.host;
    }
  }, []);

  if (!mounted || !sessionChecked) {
    return <div className="app-layout" suppressHydrationWarning><main className="app-main" style={{ padding: 24 }}>로딩 중...</main></div>;
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!isLoggedIn()) {
    return null;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}
