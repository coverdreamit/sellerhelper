'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MENU } from '@/config/menu';
import { getCookie, setCookie } from '@/utils/cookie';
import './Sidebar.css';

const SITE_NAME = '셀러헬퍼';
const COOKIE_KEY_SIDEBAR = 'sidebar_collapsed';
/** 쿠키에는 '닫힌' 메뉴 키만 저장 → 없으면 전부 펼침 */
const COOKIE_KEY_MENU_CLOSED = 'menu_closed_keys';

/** 자식이 있는 메뉴 키만 재귀 수집 (1·2·3단 그룹) */
function collectGroupKeys(items) {
  const keys = [];
  function walk(list) {
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

function getFirstChildPath(item) {
  if (item.path) return item.path;
  if (item.children?.length) return getFirstChildPath(item.children[0]);
  return '/';
}

function isMenuActive(item, pathname) {
  const firstPath = getFirstChildPath(item);
  if (item.path && (pathname === item.path || pathname.startsWith(item.path + '/'))) return true;
  if (firstPath !== '/' && (pathname === firstPath || pathname.startsWith(firstPath + '/'))) return true;
  return false;
}

function NavItem({ item, depth, collapsed, openKeys, toggleOpen }) {
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
  const [collapsed, setCollapsedState] = useState(false);

  const allGroupKeys = useMemo(() => collectGroupKeys(MENU), []);

  const [closedKeys, setClosedKeys] = useState(() => new Set());
  const openKeys = useMemo(
    () => new Set(allGroupKeys.filter((k) => !closedKeys.has(k))),
    [allGroupKeys, closedKeys]
  );

  useEffect(() => {
    const savedSidebar = getCookie(COOKIE_KEY_SIDEBAR);
    if (savedSidebar === '1') setCollapsedState(true);

    const savedClosed = getCookie(COOKIE_KEY_MENU_CLOSED);
    if (savedClosed) {
      const keys = savedClosed.split(',').map((k) => k.trim()).filter(Boolean);
      setClosedKeys(new Set(keys));
    }
  }, []);

  const toggleSidebar = () => {
    setCollapsedState((prev) => {
      const next = !prev;
      setCookie(COOKIE_KEY_SIDEBAR, next ? '1' : '0');
      return next;
    });
  };

  const toggleOpen = (key) => {
    setClosedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      setCookie(COOKIE_KEY_MENU_CLOSED, [...next].join(','));
      return next;
    });
  };

  const expandAll = () => {
    setClosedKeys(new Set());
    setCookie(COOKIE_KEY_MENU_CLOSED, '');
  };

  const collapseAll = () => {
    setClosedKeys(new Set(allGroupKeys));
    setCookie(COOKIE_KEY_MENU_CLOSED, [...allGroupKeys].join(','));
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
            {MENU.filter((item) => !item.hidden).map((item) => (
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
