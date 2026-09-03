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
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-950/80 text-sky-400 border border-sky-800/60">OPEN</span>;
      case 'VERIFIED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">VERIFIED</span>;
      case 'IN_PROGRESS':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950/80 text-amber-400 border border-amber-800/60">IN PROGRESS</span>;
      case 'RESOLVED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">RESOLVED</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-950/80 text-red-400 border border-red-800/60">REJECTED</span>;
    }
  };

  const getSeverityBadge = (severity: ReportSeverity) => {
    switch (severity) {
      case 'LOW':
        return <span className="text-slate-400 text-xs font-medium">Low Severity</span>;
      case 'MEDIUM':
        return <span className="text-yellow-400 text-xs font-medium">Medium Severity</span>;
      case 'HIGH':
        return <span className="text-amber-400 text-xs font-medium">High Severity</span>;
      case 'CRITICAL':
        return <span className="text-red-400 text-xs font-semibold">Critical Severity</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <FileText className="h-6 w-6 text-cyan-400" />
            <span>My Submitted Reports</span>
          </h1>
          <p className="text-xs text-slate-400">Track and manage your registered civic infrastructure reports</p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-semibold text-white shadow-md transition-all w-fit"
        >
          <AlertCircle className="h-4 w-4" />
          <span>New Report</span>
        </Link>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/60 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-400 pr-2 border-r border-slate-800">
          <Filter className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-semibold">Filter By:</span>
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="POTHOLE">Potholes & Roads</option>
          <option value="GARBAGE">Garbage & Waste</option>
          <option value="STREETLIGHT">Streetlights</option>
          <option value="WATER_LEAK">Water Leaks</option>
          <option value="DAMAGED_INFRASTRUCTURE">Damaged Infrastructure</option>
          <option value="OTHER">Other</option>
        </select>

        <select
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
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
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="VERIFIED">Verified</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Loading & Empty States */}
      {isLoading && (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <div className="h-6 w-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs">Loading reports...</p>
        </div>
      )}

      {isError && (
        <div className="rounded-xl border border-red-800 bg-red-950/60 p-4 text-xs text-red-300">
          Failed to load reports. Please try again.
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400">
            <Clock className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-semibold text-white">No Reports Found</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No civic reports match your filter criteria or you haven't submitted a report yet.
          </p>
        </div>
      )}

      {/* Reports List Cards */}
      {data && data.items.length > 0 && (
        <div className="space-y-4">
          {data.items.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all flex flex-col sm:flex-row justify-between gap-4"
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(report.status)}
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    {report.category.replace('_', ' ')}
                  </span>
                  {getSeverityBadge(report.severity)}
                </div>

                <h3 className="text-lg font-bold text-white">{report.title}</h3>
                <p className="text-xs text-slate-300 line-clamp-2">{report.description}</p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" />
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
                    className="h-16 w-20 object-cover rounded-lg border border-slate-700"
                  />
                )}

                <Link
                  to={`/reports/${report.id}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  <span>View Details</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          {data.pages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
              <span className="text-slate-400">
                Page {data.page} of {data.pages} ({data.total} total reports)
              </span>
              <div className="flex space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>
                <button
                  disabled={page >= data.pages}
                  onClick={() => setPage((p) => p + 1)}
                  className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-slate-300 disabled:opacity-40 hover:bg-slate-800"
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
