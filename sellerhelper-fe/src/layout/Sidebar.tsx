'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MENU, filterMenuByRoles, type MenuItem } from '@/config/menu';
import { storage } from '@/shared/storage/storage';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { useAuthStore } from '@/stores';
import { logout as logoutApi } from '@/services/auth.service';
import './Sidebar.css';

const SITE_NAME = '셀러헬퍼';

/** 자식이 있는 메뉴 키만 재귀 수집 (1·2·3단 그룹) */
function collectGroupKeys(items: MenuItem[]): string[] {
  const keys: string[] = [];
  function walk(list: MenuItem[] | undefined) {
    if (!list) return;
    for (const item of list) {
      if (item.children?.length) {
        keys.push(item.key);
        walk(item.children);
      }
    }
  }
  walk(items);
  return keys;
}

function getFirstChildPath(item: MenuItem): string {
  if (item.path) return item.path;
  if (item.children?.length) return getFirstChildPath(item.children[0]);
  return '/';
}

function isMenuActive(item: MenuItem, pathname: string | null): boolean {
  const firstPath = getFirstChildPath(item);
  if (item.path && (pathname === item.path || pathname.startsWith(item.path + '/'))) return true;
  if (firstPath !== '/' && (pathname === firstPath || pathname.startsWith(firstPath + '/'))) return true;
  return false;
}

interface NavItemProps {
  item: MenuItem;
  depth: number;
  collapsed: boolean;
  openKeys: Set<string>;
  toggleOpen: (key: string) => void;
}

function NavItem({ item, depth, collapsed, openKeys, toggleOpen }: NavItemProps) {
  const pathname = usePathname();
  const hasNested = item.children?.length > 0;
  const hasGrandChildren = item.children?.some((c) => c.children?.length > 0);
  const firstPath = getFirstChildPath(item);
  const isActive = isMenuActive(item, pathname);
  const firstChar = item.label.charAt(0);
  const isOpen = openKeys.has(item.key);

  /* 사이드바가 접혀 있으면: 1단만 첫 글자로 표시 */
  if (collapsed) {
    return (
      <li key={item.key} className={`sidebar-nav-item ${item.key === 'dashboard' ? 'nav-item-bold' : ''}`}>
        <Link href={firstPath} className={isActive ? 'active' : ''} title={item.label}>
          <span className="nav-item-char">{firstChar}</span>
          <span>{item.label}</span>
        </Link>
      </li>
    );
  }

  /* 3단 구조: 그룹 라벨 + 자식들(각각 접기/펼치기 가능) */
  if (hasGrandChildren) {
    return (
      <li key={item.key} className="sidebar-nav-item sidebar-nav-group">
        <button
          type="button"
          className="sidebar-nav-group-btn"
          onClick={() => toggleOpen(item.key)}
          aria-expanded={isOpen}
          aria-label={isOpen ? `${item.label} 메뉴 접기` : `${item.label} 메뉴 펼치기`}
        >
          <span className="sidebar-nav-group-label">{item.label}</span>
          <span className={`sidebar-nav-chevron ${isOpen ? 'open' : ''}`} aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </button>
        {isOpen && (
          <ul className="sidebar-nav-children">
            {item.children.map((sub) => (
              <NavItem
                key={sub.key}
                item={sub}
                depth={depth + 1}
                collapsed={false}
                openKeys={openKeys}
                toggleOpen={toggleOpen}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  /* 2단 구조: 그룹 라벨 + 자식 링크 (접기/펼치기) */
  if (hasNested && !hasGrandChildren) {
    return (
      <li key={item.key} className="sidebar-nav-item sidebar-nav-group">
        <button
          type="button"
          className="sidebar-nav-group-btn"
          onClick={() => toggleOpen(item.key)}
          aria-expanded={isOpen}
          aria-label={isOpen ? `${item.label} 메뉴 접기` : `${item.label} 메뉴 펼치기`}
        >
          <span className="sidebar-nav-group-label">{item.label}</span>
          <span className={`sidebar-nav-chevron ${isOpen ? 'open' : ''}`} aria-hidden>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </button>
        {isOpen && (
          <ul className="sidebar-nav-children">
            {item.children.map((child) => (
              <NavItem
                key={child.key}
                item={child}
                depth={depth + 1}
                collapsed={false}
                openKeys={openKeys}
                toggleOpen={toggleOpen}
              />
            ))}
          </ul>
        )}
      </li>
    );
  }

  /* 단일 링크 */
  if (item.path) {
    return (
      <li key={item.key} className={`sidebar-nav-item ${item.key === 'dashboard' ? 'nav-item-bold' : ''}`}>
        <Link href={item.path} className={pathname === item.path ? 'active' : ''}>
          <span className="nav-item-char">{firstChar}</span>
          <span>{item.label}</span>
        </Link>
      </li>
    );
  }

  return null;
}

export default function Sidebar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsedState] = useState(false);

  const visibleMenu = useMemo(
    () => filterMenuByRoles(MENU, user?.menuKeys ?? []),
    [user?.menuKeys]
  );

  const handleLogout = async () => {
    await logoutApi();
    logout();
    router.replace('/login');
  };

  const allGroupKeys = useMemo(() => collectGroupKeys(visibleMenu), [visibleMenu]);

  const [closedKeys, setClosedKeys] = useState(() => new Set());
  const openKeys = useMemo(
    () => new Set(allGroupKeys.filter((k) => !closedKeys.has(k))),
    [allGroupKeys, closedKeys]
  );

  useEffect(() => {
    const savedSidebar = storage.get<string | boolean | number>(STORAGE_KEYS.SIDEBAR_COLLAPSED, false);
    if (savedSidebar === true || savedSidebar === '1' || savedSidebar === 1) setCollapsedState(true);

    const savedClosed = storage.get<string>(STORAGE_KEYS.MENU_CLOSED_KEYS, '');
    if (savedClosed && typeof savedClosed === 'string') {
      const keys = savedClosed.split(',').map((k: string) => k.trim()).filter(Boolean);
      setClosedKeys(new Set(keys));
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsedState((prev) => {
      const next = !prev;
      storage.set(STORAGE_KEYS.SIDEBAR_COLLAPSED, next);
      return next;
    });
  };

  const toggleOpen = (key) => {
    setClosedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      storage.set(STORAGE_KEYS.MENU_CLOSED_KEYS, [...next].join(','));
      return next;
    });
  };

  const expandAll = () => {
    setClosedKeys(new Set());
    storage.set(STORAGE_KEYS.MENU_CLOSED_KEYS, '');
  };

  const collapseAll = () => {
    setClosedKeys(new Set(allGroupKeys));
    storage.set(STORAGE_KEYS.MENU_CLOSED_KEYS, [...allGroupKeys].join(','));
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo" aria-hidden>S</div>
        <span className="sidebar-title">{SITE_NAME}</span>
        <button
          type="button"
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          title={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
        >
          {collapsed ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          )}
        </button>
      </div>
      {user && !collapsed && (
        <div className="sidebar-user">
          <span className="sidebar-user-name">{user.name}({user.loginId})</span>
          <button type="button" className="sidebar-logout" onClick={handleLogout} aria-label="로그아웃">
            로그아웃
          </button>
        </div>
      )}
      <div className="sidebar-nav-wrap">
        {!collapsed && allGroupKeys.length > 0 && (
          <div className="sidebar-menu-toggle-bar">
            <button
              type="button"
              className="sidebar-menu-toggle-btn"
              onClick={expandAll}
              aria-label="메뉴 모두 펼치기"
              title="메뉴 모두 펼치기"
            >
              모두 펼치기
            </button>
            <button
              type="button"
              className="sidebar-menu-toggle-btn"
              onClick={collapseAll}
              aria-label="메뉴 모두 접기"
              title="메뉴 모두 접기"
            >
              모두 접기
            </button>
          </div>
        )}
        <nav>
          <ul className="sidebar-nav">
            {visibleMenu.filter((item) => !item.hidden).map((item) => (
              <NavItem
                key={item.key}
                item={item}
                depth={0}
                collapsed={collapsed}
                openKeys={openKeys}
                toggleOpen={toggleOpen}
              />
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
