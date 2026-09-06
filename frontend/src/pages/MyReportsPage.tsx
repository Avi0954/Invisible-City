import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReports } from '../hooks/useReports';
import { ReportCategory, ReportSeverity, ReportStatus } from '../types/report';
import {
  FileText,
  Clock,
  AlertCircle,
  Filter,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ExternalLink
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

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'OPEN':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-100 text-sky-900 border border-sky-300">OPEN</span>;
      case 'VERIFIED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e1f3ee] text-[#06291b] border border-[#a2d8cb]">VERIFIED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#e1f3ee] text-[#06291b] border border-[#a2d8cb]">RESOLVED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-100 text-red-900 border border-red-300">REJECTED</span>;
    }
  };

  const getSeverityBadge = (severity: ReportSeverity) => {
    switch (severity) {
      case 'LOW':
        return <span className="text-[#787770] text-xs font-medium">Low Severity</span>;
      case 'MEDIUM':
        return <span className="text-amber-700 text-xs font-medium">Medium Severity</span>;
      case 'HIGH':
        return <span className="text-amber-800 text-xs font-semibold">High Severity</span>;
      case 'CRITICAL':
        return <span className="text-red-700 text-xs font-bold">Critical Severity</span>;
    }
  };

  return (
    <div className="space-y-6 font-sans text-[#1c1c18]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1c1c18] tracking-tight flex items-center space-x-2 font-headline">
            <FileText className="h-6 w-6 text-[#2f685f]" />
            <span>My Reports</span>
          </h1>
          <p className="text-xs text-[#787770]">Track your submitted community reports and status updates</p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center space-x-2 rounded-xl bg-[#06291b] hover:bg-[#0a3826] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition-all w-fit font-headline"
        >
          <AlertCircle className="h-4 w-4" />
          <span>Report an Issue</span>
        </Link>
      </div>

      {/* Summary Row */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] p-4 space-y-1">
            <div className="text-xs text-[#787770] font-medium font-sans">Total Reports</div>
            <div className="text-2xl font-bold text-[#1c1c18] font-headline">{data.total}</div>
          </div>
          <div className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] p-4 space-y-1">
            <div className="text-xs text-[#787770] font-medium font-sans">Open</div>
            <div className="text-2xl font-bold text-sky-800 font-headline">
              {data.items.filter(r => r.status === 'OPEN').length}
            </div>
          </div>
          <div className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] p-4 space-y-1">
            <div className="text-xs text-[#787770] font-medium font-sans">In Progress</div>
            <div className="text-2xl font-bold text-amber-800 font-headline">
              {data.items.filter(r => r.status === 'IN_PROGRESS').length}
            </div>
          </div>
          <div className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] p-4 space-y-1">
            <div className="text-xs text-[#787770] font-medium font-sans">Resolved</div>
            <div className="text-2xl font-bold text-[#06291b] font-headline">
              {data.items.filter(r => r.status === 'RESOLVED').length}
            </div>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-[#e5e2da] bg-[#f1eee7] text-xs">
        <div className="flex items-center space-x-1.5 text-[#484742] pr-2 border-r border-[#d0cdc5]">
          <Filter className="h-3.5 w-3.5 text-[#2f685f]" />
          <span className="font-semibold">Filter:</span>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] px-3 py-1.5 text-xs text-[#1c1c18] focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="POTHOLE">Potholes & Roads</option>
          <option value="GARBAGE">Garbage & Sanitation</option>
          <option value="STREETLIGHT">Streetlights & Power</option>
          <option value="WATER_LEAK">Water & Sewage</option>
          <option value="DAMAGED_INFRASTRUCTURE">Damaged Infrastructure</option>
          <option value="OTHER">Other Issues</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] px-3 py-1.5 text-xs text-[#1c1c18] focus:outline-none"
        >
          <option value="">All Severities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] px-3 py-1.5 text-xs text-[#1c1c18] focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="VERIFIED">Verified</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {/* Loading & Empty States */}
      {isLoading && (
        <div className="p-12 text-center text-[#787770] space-y-3">
          <div className="h-6 w-6 rounded-full border-2 border-[#06291b] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs">Loading reports...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-800">
          Failed to load reports. Please try again.
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] p-12 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#e5e2da] text-[#787770]">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-[#1c1c18] font-headline">No Reports Found</h3>
          <p className="text-xs text-[#787770] max-w-md mx-auto">
            You haven't submitted any reports matching your filters.
          </p>
        </div>
      )}

      {/* Reports List Cards */}
      {data && data.items.length > 0 && (
        <div className="space-y-4">
          {data.items.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] p-5 hover:border-[#d0cdc5] transition-all flex flex-col sm:flex-row justify-between gap-4 shadow-sm"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(report.status)}
                  <span className="text-[11px] font-semibold text-[#484742] uppercase tracking-wider bg-[#fcf9f2] px-2 py-0.5 rounded border border-[#e5e2da]">
                    {report.category.replace('_', ' ')}
                  </span>
                  {getSeverityBadge(report.severity)}
                </div>

                <h3 className="text-lg font-bold text-[#1c1c18] font-headline">{report.title}</h3>
                <p className="text-xs text-[#484742] line-clamp-2">{report.description}</p>

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
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-[#06291b] hover:underline transition-colors"
                >
                  <span>View Details</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {data.pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#e5e2da] text-xs">
              <span className="text-[#787770]">
                Page {data.page} of {data.pages} ({data.total} total reports)
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center space-x-1 rounded-xl border border-[#d0cdc5] bg-[#f1eee7] px-3 py-1.5 text-[#1c1c18] disabled:opacity-40 hover:bg-[#e5e2da]"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                <button
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center space-x-1 rounded-xl border border-[#d0cdc5] bg-[#f1eee7] px-3 py-1.5 text-[#1c1c18] disabled:opacity-40 hover:bg-[#e5e2da]"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

