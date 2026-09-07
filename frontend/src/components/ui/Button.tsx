import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  let variantStyles = 'bg-[#06291b] text-white hover:bg-[#0a3826] border-transparent shadow-xs';

  if (variant === 'secondary') {
    variantStyles = 'bg-[#f1eee7] text-[#1c1c18] hover:bg-[#e5e2da] border-[#d0cdc5]';
  } else if (variant === 'outline') {
    variantStyles = 'bg-transparent text-[#1c1c18] border-[#d0cdc5] hover:bg-[#f1eee7]';
  } else if (variant === 'ghost') {
    variantStyles = 'bg-transparent text-[#484742] hover:text-[#1c1c18] hover:bg-[#f1eee7] border-transparent';
  } else if (variant === 'destructive') {
    variantStyles = 'bg-red-700 text-white hover:bg-red-800 border-transparent shadow-xs';
  } else if (variant === 'accent') {
    variantStyles = 'bg-[#2f685f] text-white hover:bg-[#25544d] border-transparent shadow-xs';
  }

  let sizeStyles = 'px-4 py-2.5 text-xs rounded-xl';
  if (size === 'sm') {
    sizeStyles = 'px-3 py-1.5 text-[11px] rounded-lg';
  } else if (size === 'lg') {
    sizeStyles = 'px-6 py-3.5 text-sm rounded-xl font-bold';
  }

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center space-x-2 font-headline font-semibold border transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#06291b]/30 disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children && <span>{children}</span>}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
