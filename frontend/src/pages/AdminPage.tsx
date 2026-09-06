import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useAdminOverview,
  useAdminReports,
  useVerifyReport,
  useUpdateReportStatus,
  useAdminAuditLogs,
  useAdminFlags,
} from '../hooks/useAdmin';
import {
  ShieldCheck,
  CheckCircle2,
  Filter,
  Info,
  ExternalLink,
  History,
  Flag,
  Sparkles,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'triage' | 'audit' | 'flags'>('triage');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [verificationFilter, setVerificationFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [selectedReasons, setSelectedReasons] = useState<{ id: string; reasons: string[] } | null>(null);

  const { data: overview, isLoading: overviewLoading } = useAdminOverview();
  const { data: reportsData, isLoading: reportsLoading, refetch } = useAdminReports({
    status: statusFilter || undefined,
    verification_status: verificationFilter || undefined,
    severity: severityFilter || undefined,
    limit: 50,
  });
  const { data: auditLogs, isLoading: auditLoading } = useAdminAuditLogs();
  const { data: flags, isLoading: flagsLoading } = useAdminFlags();

  const verifyMutation = useVerifyReport();
  const statusMutation = useUpdateReportStatus();

  const handleVerifyChange = async (reportId: string, newVerificationStatus: string) => {
    await verifyMutation.mutateAsync({ reportId, verification_status: newVerificationStatus });
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    await statusMutation.mutateAsync({ reportId, status: newStatus });
  };

  const getPriorityBadgeClass = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-red-100 text-red-900 border-red-300';
      case 'HIGH':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'MEDIUM':
        return 'bg-[#e1f3ee] text-[#06291b] border-[#a2d8cb]';
      default:
        return 'bg-[#e5e2da] text-[#484742] border-[#d0cdc5]';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans text-[#1c1c18]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1c1c18] tracking-tight flex items-center space-x-2 font-headline">
            <ShieldCheck className="h-6 w-6 text-[#2f685f]" />
            <span>Issues Requiring Attention</span>
          </h1>
          <p className="text-xs text-[#787770]">
            Review, verify, and prioritize community reports requiring city attention.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center space-x-1.5 rounded-xl border border-[#d0cdc5] bg-[#f1eee7] hover:bg-[#e5e2da] px-3.5 py-2 text-xs font-semibold text-[#1c1c18] transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4 text-[#2f685f]" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] p-4 space-y-1">
          <div className="text-[11px] text-[#787770] font-semibold uppercase tracking-wider font-headline">Total Reports</div>
          <div className="text-2xl font-extrabold text-[#1c1c18] font-mono">
            {overviewLoading ? '...' : overview?.total_reports ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-4 space-y-1">
          <div className="text-[11px] text-sky-900 font-semibold uppercase tracking-wider font-headline">Open Reports</div>
          <div className="text-2xl font-extrabold text-sky-900 font-mono">
            {overviewLoading ? '...' : overview?.open_reports ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-[#a2d8cb] bg-[#e1f3ee] p-4 space-y-1">
          <div className="text-[11px] text-[#06291b] font-semibold uppercase tracking-wider font-headline">Verified</div>
          <div className="text-2xl font-extrabold text-[#06291b] font-mono">
            {overviewLoading ? '...' : overview?.verified_reports ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-[#a2d8cb] bg-[#e1f3ee] p-4 space-y-1">
          <div className="text-[11px] text-[#06291b] font-semibold uppercase tracking-wider font-headline">Resolved</div>
          <div className="text-2xl font-extrabold text-[#06291b] font-mono">
            {overviewLoading ? '...' : overview?.resolved_reports ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 space-y-1">
          <div className="text-[11px] text-amber-900 font-semibold uppercase tracking-wider font-headline flex items-center space-x-1">
            <Sparkles className="h-3 w-3 text-amber-700" />
            <span>Hotspots</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-900 font-mono">
            {overviewLoading ? '...' : overview?.hotspot_count ?? 0}
          </div>
        </div>

        <div className="rounded-2xl border border-red-200 bg-red-50/80 p-4 space-y-1">
          <div className="text-[11px] text-red-900 font-semibold uppercase tracking-wider font-headline flex items-center space-x-1">
            <AlertCircle className="h-3 w-3 text-red-700" />
            <span>High Priority</span>
          </div>
          <div className="text-2xl font-extrabold text-red-900 font-mono">
            {overviewLoading ? '...' : overview?.high_priority_count ?? 0}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-[#e5e2da] pb-3">
        <button
          onClick={() => setActiveTab('triage')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'triage'
              ? 'bg-[#06291b] text-white'
              : 'text-[#484742] hover:bg-[#e5e2da] bg-[#f1eee7]'
          }`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Priority Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'audit'
              ? 'bg-[#06291b] text-white'
              : 'text-[#484742] hover:bg-[#e5e2da] bg-[#f1eee7]'
          }`}
        >
          <History className="h-4 w-4" />
          <span>Audit Records ({auditLogs?.length ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'flags'
              ? 'bg-[#06291b] text-white'
              : 'text-[#484742] hover:bg-[#e5e2da] bg-[#f1eee7]'
          }`}
        >
          <Flag className="h-4 w-4" />
          <span>Moderation Flags ({flags?.length ?? 0})</span>
        </button>
      </div>

      {/* TRIAGE QUEUE TAB */}
      {activeTab === 'triage' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl border border-[#e5e2da] bg-[#f1eee7] text-xs">
            <div className="flex items-center space-x-1.5 text-[#484742] font-semibold pr-2 border-r border-[#d0cdc5]">
              <Filter className="h-3.5 w-3.5 text-[#2f685f]" />
              <span>Queue Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] px-3 py-1.5 text-xs text-[#1c1c18] focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="VERIFIED">Verified</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] px-3 py-1.5 text-xs text-[#1c1c18] focus:outline-none"
            >
              <option value="">All Verifications</option>
              <option value="UNVERIFIED">Unverified</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ADMIN_VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] px-3 py-1.5 text-xs text-[#1c1c18] focus:outline-none"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Priority Reasons Modal */}
          {selectedReasons && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1c1c18]/60 backdrop-blur-sm">
              <div className="rounded-2xl border border-[#e5e2da] bg-[#fcf9f2] p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-[#1c1c18] text-sm flex items-center space-x-1.5 font-headline">
                    <AlertCircle className="h-4 w-4 text-[#2f685f]" />
                    <span>Priority Score Context</span>
                  </h3>
                  <button
                    onClick={() => setSelectedReasons(null)}
                    className="text-[#787770] hover:text-[#1c1c18]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <ul className="space-y-2 text-xs text-[#484742]">
                  {selectedReasons.reasons.map((r, idx) => (
                    <li key={idx} className="flex items-start space-x-2 bg-[#f1eee7] p-2.5 rounded-xl border border-[#e5e2da]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#2f685f] flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedReasons(null)}
                  className="w-full py-2 rounded-xl bg-[#06291b] hover:bg-[#0a3826] text-xs font-semibold text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Triage Table */}
          <div className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] overflow-hidden shadow-sm">
            {reportsLoading ? (
              <div className="p-12 text-center text-[#787770] space-y-2">
                <div className="h-5 w-5 rounded-full border-2 border-[#06291b] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs">Loading queue...</p>
              </div>
            ) : reportsData && reportsData.items.length === 0 ? (
              <div className="p-12 text-center text-[#787770] text-xs space-y-1">
                <Info className="h-6 w-6 text-[#787770] mx-auto" />
                <p>No reports currently matching filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1c1c18]">
                  <thead className="bg-[#e5e2da] text-[#484742] font-semibold uppercase text-[10px] tracking-wider border-b border-[#d0cdc5]">
                    <tr>
                      <th className="py-3.5 px-4">Priority</th>
                      <th className="py-3.5 px-4">Issue Details</th>
                      <th className="py-3.5 px-4">Category / Severity</th>
                      <th className="py-3.5 px-4">Verification</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e5e2da]">
                    {reportsData?.items.map((report) => (
                      <tr key={report.id} className="hover:bg-[#fcf9f2] transition-colors">
                        {/* Priority Score Column */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setSelectedReasons({ id: report.id, reasons: report.priority_reasons })}
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${getPriorityBadgeClass(report.priority_level)}`}
                            title="Click to view priority details"
                          >
                            <span>{report.priority_score}</span>
                            <span className="text-[10px]">({report.priority_level})</span>
                          </button>
                        </td>

                        {/* Title & Description */}
                        <td className="py-3.5 px-4 space-y-0.5 max-w-xs">
                          <Link
                            to={`/reports/${report.id}`}
                            className="font-bold text-[#1c1c18] hover:text-[#06291b] transition-colors block line-clamp-1 text-xs font-headline"
                          >
                            {report.title}
                          </Link>
                          <div className="text-[11px] text-[#787770] line-clamp-1">{report.description}</div>
                          <div className="text-[10px] text-[#787770]">By {report.user_name || 'Resident'} • {new Date(report.created_at).toLocaleDateString()}</div>
                        </td>

                        {/* Category / Severity */}
                        <td className="py-3.5 px-4 space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded bg-[#fcf9f2] text-[#484742] border border-[#e5e2da] text-[10px] font-semibold uppercase">
                            {report.category.replace('_', ' ')}
                          </span>
                          <div className="text-[11px] font-semibold text-amber-800">{report.severity}</div>
                        </td>

                        {/* Verification Status Dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={report.verification_status}
                            onChange={(e) => handleVerifyChange(report.id, e.target.value)}
                            disabled={verifyMutation.isPending}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold focus:outline-none ${
                              report.verification_status === 'ADMIN_VERIFIED'
                                ? 'bg-[#e1f3ee] text-[#06291b] border-[#a2d8cb]'
                                : report.verification_status === 'REJECTED'
                                ? 'bg-red-100 text-red-900 border-red-300'
                                : 'bg-amber-50 text-amber-900 border-amber-300'
                            }`}
                          >
                            <option value="UNVERIFIED">UNVERIFIED</option>
                            <option value="UNDER_REVIEW">UNDER REVIEW</option>
                            <option value="ADMIN_VERIFIED">VERIFIED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={report.status}
                            onChange={(e) => handleStatusChange(report.id, e.target.value)}
                            disabled={statusMutation.isPending}
                            className="rounded-lg border border-[#d0cdc5] bg-[#fcf9f2] px-2.5 py-1 text-[11px] text-[#1c1c18] focus:outline-none"
                          >
                            <option value="OPEN">OPEN</option>
                            <option value="VERIFIED">VERIFIED</option>
                            <option value="IN_PROGRESS">IN PROGRESS</option>
                            <option value="RESOLVED">RESOLVED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            to={`/reports/${report.id}`}
                            className="inline-flex items-center space-x-1 text-[#06291b] hover:underline text-xs font-semibold"
                          >
                            <span>View</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUDIT LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-[#1c1c18] text-sm flex items-center space-x-2 font-headline">
            <History className="h-4 w-4 text-[#2f685f]" />
            <span>Audit Log Records</span>
          </h3>

          {auditLoading ? (
            <div className="p-6 text-center text-[#787770] text-xs">Loading audit logs...</div>
          ) : auditLogs && auditLogs.length === 0 ? (
            <div className="p-6 text-center text-[#787770] text-xs">No administrative actions recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {auditLogs?.map((log) => (
                <div key={log.id} className="rounded-xl border border-[#e5e2da] bg-[#fcf9f2] p-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#06291b] font-mono">{log.action}</span>
                    <div className="text-[11px] text-[#787770]">
                      Entity: {log.entity_type} ({log.entity_id || 'N/A'})
                    </div>
                  </div>
                  <div className="text-[10px] text-[#787770] font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODERATION FLAGS TAB */}
      {activeTab === 'flags' && (
        <div className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-[#1c1c18] text-sm flex items-center space-x-2 font-headline">
            <Flag className="h-4 w-4 text-amber-700" />
            <span>Moderation Flags</span>
          </h3>

          {flagsLoading ? (
            <div className="p-6 text-center text-[#787770] text-xs">Loading moderation flags...</div>
          ) : flags && flags.length === 0 ? (
            <div className="p-6 text-center text-[#787770] text-xs">No moderation flags reported.</div>
          ) : (
            <div className="space-y-2">
              {flags?.map((flag) => (
                <div key={flag.id} className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-900 uppercase font-mono">{flag.reason}</span>
                    <div className="text-[11px] text-amber-950">Details: {flag.details || 'No details provided'}</div>
                  </div>
                  <Link
                    to={`/reports/${flag.report_id}`}
                    className="inline-flex items-center space-x-1 text-[#06291b] hover:underline font-semibold"
                  >
                    <span>View Report</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

