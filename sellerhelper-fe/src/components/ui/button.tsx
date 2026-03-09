import * as React from 'react';
import { cn } from '@/lib/utils';

const BASE_CLASSES =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0';

const VARIANT_CLASSES: Record<string, string> = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

const SIZE_CLASSES: Record<string, string> = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

function getButtonVariants(variant?: string, size?: string, className?: string) {
  const v = variant && VARIANT_CLASSES[variant] ? variant : 'default';
  const s = size && SIZE_CLASSES[size] ? size : 'default';
  return cn(BASE_CLASSES, VARIANT_CLASSES[v], SIZE_CLASSES[s], className);
}

export type ButtonVariant = keyof typeof VARIANT_CLASSES;
export type ButtonSize = keyof typeof SIZE_CLASSES;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const mergedClassName = getButtonVariants(variant, size, className);
    if (asChild && React.isValidElement(children) && React.Children.count(children) === 1) {
      const child = React.Children.only(children) as React.ReactElement;
      return React.cloneElement(child, {
        ...props,
        ...child.props,
        className: cn(mergedClassName, child.props?.className),
        ref: (child as React.RefAttributes<unknown>).ref ?? ref,
      } as Record<string, unknown>);
    }
    return (
      <button type="button" className={mergedClassName} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export const buttonVariants = { get: getButtonVariants };
export { Button };
