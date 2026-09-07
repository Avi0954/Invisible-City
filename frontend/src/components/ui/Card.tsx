import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'container' | 'bordered' | 'flat';
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  variant = 'container',
  children,
  className = '',
  ...props
}) => {
  let variantClass = 'bg-[#f1eee7] border border-[#e5e2da]';
  if (variant === 'surface') {
    variantClass = 'bg-[#fcf9f2] border border-[#e5e2da]';
  } else if (variant === 'bordered') {
    variantClass = 'bg-[#fcf9f2] border-2 border-[#d0cdc5]';
  } else if (variant === 'flat') {
    variantClass = 'bg-[#ebe8e1] border-transparent';
  }

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 shadow-xs transition-all ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
