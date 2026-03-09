'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CollapsibleContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextValue | null>(null);

function useCollapsible() {
  const ctx = React.useContext(CollapsibleContext);
  if (!ctx) throw new Error('Collapsible components must be used within Collapsible');
  return ctx;
}

const Collapsible = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
  }
>(({ className, open: controlledOpen, defaultOpen = false, onOpenChange, children, ...props }, ref) => {
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
  return (
    <CollapsibleContext.Provider value={{ open, onOpenChange: setOpen }}>
      <div
        ref={ref}
        data-state={open ? 'open' : 'closed'}
        className={cn(className)}
        {...props}
      >
        {children}
      </div>
    </CollapsibleContext.Provider>
  );
});
Collapsible.displayName = 'Collapsible';

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement> & { asChild?: boolean }
>(({ className, asChild, children, onClick, ...props }, ref) => {
  const { open, onOpenChange } = useCollapsible();
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    if (React.isValidElement(children) && typeof (children as React.ReactElement).props?.onClick === 'function') {
      (children as React.ReactElement<{ onClick: React.MouseEventHandler }>).props.onClick(e);
    }
    onOpenChange(!open);
  };
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ onClick?: React.MouseEventHandler }>, {
      ref,
      onClick: handleClick,
      'data-state': open ? 'open' : 'closed',
      'aria-expanded': open,
      ...props,
    });
  }
  return (
    <button
      ref={ref}
      type="button"
      data-state={open ? 'open' : 'closed'}
      aria-expanded={open}
      className={cn(className)}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
});
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { open } = useCollapsible();
  if (!open) return null;
  return (
    <div ref={ref} data-state={open ? 'open' : 'closed'} className={cn(className)} {...props}>
      {children}
    </div>
  );
});
CollapsibleContent.displayName = 'CollapsibleContent';

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
