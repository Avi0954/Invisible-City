import React from 'react';
import { ReportStatus, ReportSeverity } from '../../types/report';

export interface StatusBadgeProps {
  status?: ReportStatus | string;
  severity?: ReportSeverity | string;
  verificationStatus?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  severity,
  verificationStatus,
  size = 'md'
}) => {
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  if (status) {
    let badgeClass = 'bg-[#e5e2da] text-[#484742] border-[#d0cdc5]';

    switch (status) {
      case 'OPEN':
        badgeClass = 'bg-sky-100 text-sky-900 border-sky-300';
        break;
      case 'VERIFIED':
        badgeClass = 'bg-[#e1f3ee] text-[#06291b] border-[#a2d8cb]';
        break;
      case 'IN_PROGRESS':
        badgeClass = 'bg-amber-100 text-amber-900 border-amber-300';
        break;
      case 'RESOLVED':
        badgeClass = 'bg-[#e1f3ee] text-[#06291b] border-[#a2d8cb]';
        break;
      case 'REJECTED':
        badgeClass = 'bg-red-100 text-red-900 border-red-300';
        break;
    }

    return (
      <span className={`inline-flex items-center font-bold rounded-full border uppercase tracking-wider font-headline ${padding} ${badgeClass}`}>
        {status.replace('_', ' ')}
      </span>
    );
  }

  if (severity) {
    let severityClass = 'bg-[#e5e2da] text-[#484742] border-[#d0cdc5]';

    switch (severity) {
      case 'LOW':
        severityClass = 'bg-slate-100 text-slate-800 border-slate-300';
        break;
      case 'MEDIUM':
        severityClass = 'bg-amber-100 text-amber-900 border-amber-300';
        break;
      case 'HIGH':
        severityClass = 'bg-amber-200 text-amber-950 border-amber-400';
        break;
      case 'CRITICAL':
        severityClass = 'bg-red-100 text-red-900 border-red-300';
        break;
    }

    return (
      <span className={`inline-flex items-center font-bold rounded-full border tracking-wider uppercase font-headline ${padding} ${severityClass}`}>
        {severity} Severity
      </span>
    );
  }

  if (verificationStatus) {
    let verClass = 'bg-amber-50 text-amber-900 border-amber-300';
    if (verificationStatus === 'ADMIN_VERIFIED' || verificationStatus === 'VERIFIED') {
      verClass = 'bg-[#e1f3ee] text-[#06291b] border-[#a2d8cb]';
    } else if (verificationStatus === 'REJECTED') {
      verClass = 'bg-red-100 text-red-900 border-red-300';
    }

    return (
      <span className={`inline-flex items-center font-bold rounded-full border tracking-wider uppercase font-headline ${padding} ${verClass}`}>
        {verificationStatus.replace('_', ' ')}
      </span>
    );
  }

  return null;
};
