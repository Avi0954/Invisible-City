import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`rounded-2xl border border-[#e5e2da] bg-[#f1eee7] p-8 sm:p-12 text-center space-y-4 shadow-xs font-sans ${className}`}>
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e5e2da] text-[#787770] border border-[#d0cdc5]">
        <Icon className="h-6 w-6 text-[#2f685f]" />
      </div>
      <div className="space-y-1.5 max-w-md mx-auto">
        <h3 className="text-base sm:text-lg font-bold text-[#1c1c18] font-headline">{title}</h3>
        <p className="text-xs text-[#787770] leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2 flex justify-center">{action}</div>}
    </div>
  );
};
