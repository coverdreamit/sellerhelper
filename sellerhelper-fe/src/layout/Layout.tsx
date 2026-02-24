'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { initAppData, useAuthStore } from '@/stores';
import { canAccessPath } from '@/config/menu';
import { getMe } from '@/services/auth.service';
import './Layout.css';

/** legacy cookies -> localStorage migration to reduce Cookie header size */
function migrateSidebarCookiesToStorage() {
  if (typeof document === 'undefined') return;
  const keys = ['sidebar_collapsed', 'menu_closed_keys'];
  for (const key of keys) {
    const m = document.cookie.match(new RegExp('(^| )' + key + '=([^;]+)'));
    if (m) {
      try {
        const val = decodeURIComponent(m[2]);
        localStorage.setItem(key, val);
        document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
      } catch {
        /* ignore */
      }
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
    migrateSidebarCookiesToStorage();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    getMe()
      .then((me) => {
        setSessionChecked(true);
        if (me) {
          setUser(me);
        } else {
          logoutStore();
        }
      })
      .catch(() => {
        setSessionChecked(true);
        logoutStore();
      });
  }, [mounted, setUser, logoutStore]);

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
      if (!canAccessPath(pathname, user.roleCodes ?? [])) {
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

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="app-main">{children}</main>
    </div>
  );
}
