'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MENU, filterMenuByRoles, type MenuItem } from '@/config/menu';
import { storage } from '@/shared/storage/storage';
import { STORAGE_KEYS } from '@/shared/storage/keys';
import { useAuthStore } from '@/stores';
import { logout as logoutApi } from '@/services/auth.service';
import { Button } from '@/components/ui/button';
import {
  Sidebar as SidebarRoot,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const SITE_NAME = '셀러헬퍼';

function IconChevronRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconPanelLeft({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="M14 9l3 3-3 3" />
    </svg>
  );
}

function IconPanelLeftClose({ className }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M9 3v18" />
      <path d="M14 15l-3-3 3-3" />
    </svg>
  );
}

/** 자식이 있는 메뉴 키만 재귀 수집 */
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
  if (item.path && (pathname === item.path || pathname?.startsWith(item.path + '/'))) return true;
  if (firstPath !== '/' && (pathname === firstPath || pathname?.startsWith(firstPath + '/'))) return true;
  return false;
}

interface NavItemProps {
  item: MenuItem;
  depth: number;
  openKeys: Set<string>;
  toggleOpen: (key: string) => void;
  setGroupOpen: (key: string, open: boolean) => void;
}

function NavItem({ item, depth, openKeys, toggleOpen, setGroupOpen }: NavItemProps) {
  const pathname = usePathname();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const hasNested = item.children?.length > 0;
  const hasGrandChildren = item.children?.some((c) => c.children?.length > 0);
  const firstPath = getFirstChildPath(item);
  const isActive = isMenuActive(item, pathname);
  const firstChar = item.label.charAt(0);
  const isOpen = openKeys.has(item.key);

  if (collapsed) {
    return (
      <SidebarMenuItem key={item.key}>
        <SidebarMenuButton asChild tooltip={item.label} isActive={isActive}>
          <Link href={firstPath}>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[13px] font-semibold text-sidebar-foreground">
              {firstChar}
            </span>
            <span className="sr-only">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  if (hasGrandChildren) {
    return (
      <SidebarMenuItem key={item.key}>
        <Collapsible open={isOpen} onOpenChange={(open) => setGroupOpen(item.key, open)} className="group/collapsible">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton aria-expanded={isOpen} aria-label={isOpen ? `${item.label} 메뉴 접기` : `${item.label} 메뉴 펼치기`}>
              <span>{item.label}</span>
              <IconChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-sidebar-foreground/70 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children!.map((sub) => (
                <NavItem key={sub.key} item={sub} depth={depth + 1} openKeys={openKeys} toggleOpen={toggleOpen} setGroupOpen={setGroupOpen} />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  }

  if (hasNested && !hasGrandChildren) {
    return (
      <SidebarMenuItem key={item.key}>
        <Collapsible open={isOpen} onOpenChange={(open) => setGroupOpen(item.key, open)} className="group/collapsible">
          <CollapsibleTrigger asChild>
            <SidebarMenuButton aria-expanded={isOpen} aria-label={isOpen ? `${item.label} 메뉴 접기` : `${item.label} 메뉴 펼치기`}>
              <span>{item.label}</span>
              <IconChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-sidebar-foreground/70 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.children!.map((child) => (
                <SidebarMenuSubItem key={child.key}>
                  <SidebarMenuSubButton asChild isActive={pathname === child.path}>
                    <Link href={child.path ?? '#'}>{child.label}</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  }

  if (item.path) {
    return (
      <SidebarMenuItem key={item.key}>
        <SidebarMenuButton asChild isActive={pathname === item.path}>
          <Link href={item.path}>{item.label}</Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return null;
}

export default function AppSidebar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { state, toggleSidebar } = useSidebar();
  const collapsed = state === 'collapsed';

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
  const [closedKeys, setClosedKeys] = useState<Set<string>>(() => new Set());
  const openKeys = useMemo(
    () => new Set(allGroupKeys.filter((k) => !closedKeys.has(k))),
    [allGroupKeys, closedKeys]
  );

  useEffect(() => {
    const savedClosed = storage.get<string>(STORAGE_KEYS.MENU_CLOSED_KEYS, '');
    if (savedClosed && typeof savedClosed === 'string') {
      const keys = savedClosed.split(',').map((k: string) => k.trim()).filter(Boolean);
      setClosedKeys(new Set(keys));
    }
  }, []);

  const toggleOpen = (key: string) => {
    setClosedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      storage.set(STORAGE_KEYS.MENU_CLOSED_KEYS, [...next].join(','));
      return next;
    });
  };

  const setGroupOpen = (key: string, open: boolean) => {
    setClosedKeys((prev) => {
      const next = new Set(prev);
      if (open) next.delete(key);
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
    <SidebarRoot>
      <SidebarHeader>
        <div
          className={cn(
            'flex shrink-0 items-center gap-2.5 border-b border-sidebar-border min-h-14',
            collapsed ? 'flex-col gap-1.5 py-3 px-2' : 'py-3.5 px-3'
          )}
        >
          <div
            className="flex shrink-0 items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground font-bold text-sm"
            aria-hidden
          >
            S
          </div>
          <span
            className={cn(
              'font-semibold text-base text-sidebar-foreground whitespace-nowrap overflow-hidden text-ellipsis',
              collapsed && 'hidden'
            )}
          >
            {SITE_NAME}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn('shrink-0', collapsed ? 'mt-1 ml-0' : 'ml-auto')}
            onClick={toggleSidebar}
            aria-label={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
            title={collapsed ? '사이드바 펼치기' : '사이드바 접기'}
          >
            {collapsed ? <IconPanelLeft className="h-4 w-4" /> : <IconPanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>
      {user && !collapsed && (
        <div className="flex shrink-0 items-center justify-between gap-2 py-2.5 px-3 border-b border-sidebar-border bg-sidebar-accent/50">
          <span className="text-[0.8125rem] text-sidebar-foreground/80 whitespace-nowrap overflow-hidden text-ellipsis">
            {user.name}({user.loginId})
          </span>
          <Button type="button" variant="outline" size="sm" onClick={handleLogout} aria-label="로그아웃">
            로그아웃
          </Button>
        </div>
      )}
      <SidebarContent>
        {!collapsed && allGroupKeys.length > 0 && (
          <SidebarGroup>
            <div className="flex gap-1.5 px-2 pb-2 mb-1 border-b border-sidebar-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={expandAll}
                aria-label="메뉴 모두 펼치기"
                title="메뉴 모두 펼치기"
              >
                모두 펼치기
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={collapseAll}
                aria-label="메뉴 모두 접기"
                title="메뉴 모두 접기"
              >
                모두 접기
              </Button>
            </div>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarMenu>
            {visibleMenu.filter((item) => !item.hidden).map((item) => (
              <NavItem
                key={item.key}
                item={item}
                depth={0}
                openKeys={openKeys}
                toggleOpen={toggleOpen}
                setGroupOpen={setGroupOpen}
              />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter />
    </SidebarRoot>
  );
}
