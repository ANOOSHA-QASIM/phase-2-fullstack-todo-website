import { ButtonHTMLAttributes, DetailedHTMLProps, ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';

interface ButtonProps
  extends DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | "icon";
  fullWidth?: boolean;
  asChild?: boolean; // ✅ support for Radix Slot
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  const baseClasses =
    'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center';

  const variantClasses = {
    primary: 'bg-[rgb(var(--primary))] text-[rgb(var(--primary-foreground))] hover:bg-[rgb(var(--primary)/0.9)] focus:ring-[rgb(var(--primary))] shadow-sm',
    secondary: 'bg-[rgb(var(--secondary))] text-[rgb(var(--secondary-foreground))] hover:bg-[rgb(var(--secondary)/0.9)] focus:ring-[rgb(var(--secondary))] shadow-sm',
    ghost: 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary)/0.5)] focus:ring-[rgb(var(--secondary))] shadow-none',
    outline: 'border border-[rgb(var(--border))] text-[rgb(var(--foreground))] hover:bg-[rgb(var(--secondary)/0.5)] focus:ring-[rgb(var(--secondary))] shadow-sm',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: "h-10 w-10 p-0",
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`;

  return (
    <Comp {...props} className={classes}>
      {children}
    </Comp>
  );
}
