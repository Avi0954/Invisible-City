import React from 'react';
import { Report } from '../../types/report';
import { ReportCard } from './ReportCard';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { FileText } from 'lucide-react';

export interface ReportListProps {
  reports: Report[];
  isLoading?: boolean;
  isError?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export const ReportList: React.FC<ReportListProps> = ({
  reports,
  isLoading = false,
  isError = false,
  emptyTitle = 'No Reports Found',
  emptyDescription = 'No community reports match the specified criteria.',
  emptyAction,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-2xl border border-[#e5e2da] bg-[#fcf9f2] space-y-3">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 font-semibold text-center">
        Unable to load report list. Please check your network connection and try again.
      </div>
    );
  }

  if (!reports || reports.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <ReportCard key={report.id} report={report} />
      ))}
    </div>
  );
};
