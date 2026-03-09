'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type SidebarContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  state: 'expanded' | 'collapsed';
  collapsible: 'icon' | 'offcanvas' | 'none';
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) throw new Error('useSidebar must be used within SidebarProvider');
  return ctx;
}

const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_COLLAPSED = '4rem';

interface SidebarProviderProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SidebarProvider({
  className,
  open: controlledOpen,
  defaultOpen = true,
  onOpenChange,
  children,
  ...props
}: SidebarProviderProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange]
  );
  const toggleSidebar = React.useCallback(() => setOpen(!open), [open, setOpen]);
  const state = open ? 'expanded' : 'collapsed';

  return (
    <SidebarContext.Provider
      value={{
        open,
        setOpen,
        toggleSidebar,
        state,
        collapsible: 'icon',
      }}
    >
      <div
        className={cn('group/sidebar-wrapper flex min-h-svh w-full', className)}
        data-sidebar="wrapper"
        style={
          {
            '--sidebar-width': SIDEBAR_WIDTH,
            '--sidebar-width-icon': SIDEBAR_WIDTH_COLLAPSED,
          } as React.CSSProperties
        }
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right';
  variant?: 'sidebar' | 'floating' | 'inset';
  collapsible?: 'offcanvas' | 'icon' | 'none';
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      side = 'left',
      variant = 'sidebar',
      collapsible = 'icon',
      children,
      ...props
    },
    ref
  ) => {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    return (
      <div
        ref={ref}
        data-sidebar="sidebar"
        data-slot="sidebar"
        data-state={state}
        data-collapsible={collapsible}
        data-side={side}
        className={cn(
          'flex h-svh flex-shrink-0 flex-col border-r border-sidebar-border bg-sidebar transition-[width] duration-200 ease-linear',
          isCollapsed ? 'w-[var(--sidebar-width-icon)] min-w-[var(--sidebar-width-icon)]' : 'w-[var(--sidebar-width)] min-w-[var(--sidebar-width)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Sidebar.displayName = 'Sidebar';

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="header"
    className={cn('flex shrink-0 flex-col gap-2 border-b border-sidebar-border p-2', className)}
    {...props}
  />
));
SidebarHeader.displayName = 'SidebarHeader';

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="content"
    className={cn(
      'flex min-h-0 flex-1 flex-col gap-2 overflow-auto p-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-sidebar-border',
      className
    )}
    {...props}
  />
));
SidebarContent.displayName = 'SidebarContent';

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="footer"
    className={cn('flex shrink-0 flex-col gap-2 border-t border-sidebar-border p-2', className)}
    {...props}
  />
));
SidebarFooter.displayName = 'SidebarFooter';

export const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} data-sidebar="group" className={cn('flex w-full flex-col gap-1', className)} {...props} />
));
SidebarGroup.displayName = 'SidebarGroup';

export const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-label"
    className={cn(
      'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none',
      className
    )}
    {...props}
  />
));
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

export const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul ref={ref} data-sidebar="menu" className={cn('flex w-full flex-col gap-1', className)} {...props} />
));
SidebarMenu.displayName = 'SidebarMenu';

export const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} data-sidebar="menu-item" className={cn('list-none', className)} {...props} />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

const menuButtonClasses =
  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring';

interface SidebarMenuButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
}

export const SidebarMenuButton = React.forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ className, asChild, isActive, tooltip, children, ...props }, ref) => {
    const mergedClassName = cn(menuButtonClasses, isActive && 'bg-sidebar-accent text-sidebar-accent-foreground', className);
    if (asChild && React.isValidElement(children) && React.Children.count(children) === 1) {
      const child = React.Children.only(children) as React.ReactElement;
      return React.cloneElement(child, {
        ...props,
        ...child.props,
        'data-sidebar': 'menu-button',
        'data-active': isActive,
        title: tooltip ?? child.props?.title,
        className: cn(mergedClassName, child.props?.className),
        ref: (child as React.RefAttributes<unknown>).ref ?? ref,
      } as Record<string, unknown>);
    }
    return (
      <button
        ref={ref}
        type="button"
        data-sidebar="menu-button"
        data-active={isActive}
        title={tooltip}
        className={mergedClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SidebarMenuButton.displayName = 'SidebarMenuButton';

export const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn('mx-3.5 flex min-w-0 flex-col gap-1 border-l border-sidebar-border px-2.5 py-1', className)}
    {...props}
  />
));
SidebarMenuSub.displayName = 'SidebarMenuSub';

export const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.HTMLAttributes<HTMLLIElement>
>(({ className, ...props }, ref) => (
  <li ref={ref} data-sidebar="menu-sub-item" className={cn('list-none', className)} {...props} />
));
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

const menuSubButtonClasses =
  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground';

interface SidebarMenuSubButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  isActive?: boolean;
}

export const SidebarMenuSubButton = React.forwardRef<HTMLButtonElement, SidebarMenuSubButtonProps>(
  ({ className, asChild, isActive, children, ...props }, ref) => {
    const mergedClassName = cn(menuSubButtonClasses, isActive && 'bg-sidebar-accent text-sidebar-accent-foreground font-medium', className);
    if (asChild && React.isValidElement(children) && React.Children.count(children) === 1) {
      const child = React.Children.only(children) as React.ReactElement;
      return React.cloneElement(child, {
        ...props,
        ...child.props,
        'data-sidebar': 'menu-sub-button',
        'data-active': isActive,
        className: cn(mergedClassName, child.props?.className),
        ref: (child as React.RefAttributes<unknown>).ref ?? ref,
      } as Record<string, unknown>);
    }
    return (
      <button
        ref={ref}
        type="button"
        data-sidebar="menu-sub-button"
        data-active={isActive}
        className={mergedClassName}
        {...props}
      >
        {children}
      </button>
    );
  }
);
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

export function SidebarTrigger({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Button>) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(className)}
      onClick={toggleSidebar}
      aria-label="사이드바 토글"
      {...props}
    />
  );
}
