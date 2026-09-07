import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { ReportCategory, ReportSeverity, ReportStatus } from '../types/report';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Pagination } from '../components/ui/Pagination';
import { ReportFilters } from '../components/reports/ReportFilters';
import { ReportList } from '../components/reports/ReportList';
import { FileText, PlusCircle } from 'lucide-react';

export const MyReportsPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading, isError } = useReports({
    page,
    limit: 10,
    my_reports_only: true,
    category: categoryFilter ? (categoryFilter as ReportCategory) : undefined,
    severity: severityFilter ? (severityFilter as ReportSeverity) : undefined,
    status: statusFilter ? (statusFilter as ReportStatus) : undefined,
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans text-[#1c1c18]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c18] tracking-tight flex items-center space-x-2.5 font-headline">
            <FileText className="h-7 w-7 text-[#2f685f]" />
            <span>My Reports</span>
          </h1>
          <p className="text-xs text-[#787770]">Track your submitted community reports and resolution status updates</p>
        </div>

        <Link to="/report">
          <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
            Report an Issue
          </Button>
        </Link>
      </div>

      {/* Summary KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card variant="surface" className="p-4 space-y-1">
            <div className="text-xs text-[#787770] font-bold uppercase tracking-wider font-headline">Total Submissions</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#1c1c18] font-headline">{data.total}</div>
          </Card>
          <Card variant="surface" className="p-4 space-y-1">
            <div className="text-xs text-sky-900 font-bold uppercase tracking-wider font-headline">Open</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-sky-800 font-headline">
              {data.items.filter(r => r.status === 'OPEN').length}
            </div>
          </Card>
          <Card variant="surface" className="p-4 space-y-1">
            <div className="text-xs text-amber-900 font-bold uppercase tracking-wider font-headline">In Progress</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-800 font-headline">
              {data.items.filter(r => r.status === 'IN_PROGRESS').length}
            </div>
          </Card>
          <Card variant="surface" className="p-4 space-y-1">
            <div className="text-xs text-[#06291b] font-bold uppercase tracking-wider font-headline">Resolved</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#06291b] font-headline">
              {data.items.filter(r => r.status === 'RESOLVED').length}
            </div>
          </Card>
        </div>
      )}

      {/* Filter Bar */}
      <ReportFilters
        category={categoryFilter}
        severity={severityFilter}
        status={statusFilter}
        onCategoryChange={(val) => { setCategoryFilter(val); setPage(1); }}
        onSeverityChange={(val) => { setSeverityFilter(val); setPage(1); }}
        onStatusChange={(val) => { setStatusFilter(val); setPage(1); }}
      />

      {/* Reports List */}
      <ReportList
        reports={data?.items || []}
        isLoading={isLoading}
        isError={isError}
        emptyTitle={categoryFilter || severityFilter || statusFilter ? 'No Matching Reports' : 'No Reports Submitted Yet'}
        emptyDescription={
          categoryFilter || severityFilter || statusFilter
            ? 'No submitted reports match your current filter criteria. Try clearing your filters.'
            : 'Be the first to report an issue in your area to notify municipal teams.'
        }
        emptyAction={
          <Link to="/report">
            <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
              Report an Issue
            </Button>
          </Link>
        }
      />

      {/* Pagination */}
      {data && data.pages > 1 && (
        <Pagination
          currentPage={data.page}
          totalPages={data.pages}
          totalItems={data.total}
          onPageChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
};
