import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { ReportCategory, ReportSeverity, ReportStatus } from '../types/report';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { Select } from '../components/ui/Input';
import {
  FileText,
  Filter,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  PlusCircle
} from 'lucide-react';

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

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-[#e5e2da] bg-[#f1eee7] text-xs">
        <div className="flex items-center space-x-1.5 text-[#484742] pr-2 border-r border-[#d0cdc5]">
          <Filter className="h-3.5 w-3.5 text-[#2f685f]" />
          <span className="font-semibold">Filter:</span>
        </div>

        <Select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="w-auto py-1 px-3 text-xs"
        >
          <option value="">All Categories</option>
          <option value="POTHOLE">Potholes & Roads</option>
          <option value="GARBAGE">Garbage & Waste</option>
          <option value="STREETLIGHT">Streetlights & Power</option>
          <option value="WATER_LEAK">Water & Sewage</option>
          <option value="DAMAGED_INFRASTRUCTURE">Damaged Infrastructure</option>
          <option value="OTHER">Other Issues</option>
        </Select>

        <Select
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
          className="w-auto py-1 px-3 text-xs"
        >
          <option value="">All Severities</option>
          <option value="LOW">Low Severity</option>
          <option value="MEDIUM">Medium Severity</option>
          <option value="HIGH">High Severity</option>
          <option value="CRITICAL">Critical Severity</option>
        </Select>

        <Select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="w-auto py-1 px-3 text-xs"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="VERIFIED">Verified</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </Select>
      </div>

      {/* Loading & Error States */}
      {isLoading && (
        <div className="p-16 text-center text-[#787770] space-y-3">
          <div className="h-6 w-6 rounded-full border-2 border-[#06291b] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs">Loading submitted reports...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800 font-semibold">
          Failed to load reports. Please try again.
        </div>
      )}

      {/* Empty State */}
      {data && data.items.length === 0 && (
        <EmptyState
          icon={FileText}
          title={categoryFilter || severityFilter || statusFilter ? 'No Matching Reports' : 'No Reports Submitted Yet'}
          description={
            categoryFilter || severityFilter || statusFilter
              ? 'No submitted reports match your current filter criteria. Try clearing your filters.'
              : 'Be the first to report an issue in your area to notify municipal teams.'
          }
          action={
            <Link to="/report">
              <Button size="sm" leftIcon={<PlusCircle className="h-4 w-4" />}>
                Report an Issue
              </Button>
            </Link>
          }
        />
      )}

      {/* Reports List Cards */}
      {data && data.items.length > 0 && (
        <div className="space-y-4">
          {data.items.map((report) => (
            <Card
              key={report.id}
              variant="container"
              className="hover:border-[#d0cdc5] transition-all flex flex-col sm:flex-row justify-between gap-4 shadow-xs"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={report.status} />
                  <span className="text-[10px] font-bold text-[#484742] uppercase tracking-wider bg-[#fcf9f2] px-2 py-0.5 rounded border border-[#e5e2da] font-headline">
                    {report.category.replace('_', ' ')}
                  </span>
                  <StatusBadge severity={report.severity} size="sm" />
                </div>

                <h3 className="text-lg font-bold text-[#1c1c18] font-headline">{report.title}</h3>
                <p className="text-xs text-[#484742] line-clamp-2 leading-relaxed">{report.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#787770] pt-1">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5 text-[#2f685f]" />
                    <span>{report.address || `${report.latitude}, ${report.longitude}`}</span>
                  </div>
                  <div>Submitted {new Date(report.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="flex sm:flex-col justify-between items-end gap-2 flex-shrink-0">
                {report.media && report.media.length > 0 && (
                  <img
                    src={report.media[0].media_url}
                    alt="Report thumbnail"
                    className="h-16 w-20 object-cover rounded-lg border border-[#e5e2da]"
                  />
                )}

                <Link
                  to={`/reports/${report.id}`}
                  className="inline-flex items-center space-x-1 text-xs font-bold text-[#06291b] hover:underline transition-colors"
                >
                  <span>View Details</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </Card>
          ))}

          {/* Pagination Controls */}
          {data.pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#e5e2da] text-xs">
              <span className="text-[#787770] font-mono">
                Page {data.page} of {data.pages} ({data.total} total reports)
              </span>
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
