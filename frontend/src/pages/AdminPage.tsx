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
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Flame,
  Search,
  Filter,
  Info,
  ExternalLink,
  History,
  Flag,
  Sparkles,
  RefreshCw,
  Check,
  X
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
        return 'bg-red-950 text-red-400 border-red-800 animate-pulse';
      case 'HIGH':
        return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'MEDIUM':
        return 'bg-cyan-950 text-cyan-400 border-cyan-800';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-cyan-400" />
            <span>Municipal Admin Triage Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400">
            Real-time municipal priority queue, verification triage, hotspot overview, and audit logging.
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="h-4 w-4 text-cyan-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-1">
          <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Total Reports</div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {overviewLoading ? '...' : overview?.total_reports ?? 0}
          </div>
        </div>

        <div className="rounded-xl border border-cyan-900/50 bg-cyan-950/30 p-4 space-y-1">
          <div className="text-[11px] text-cyan-400 font-semibold uppercase tracking-wider">Open Reports</div>
          <div className="text-2xl font-extrabold text-cyan-300 font-mono">
            {overviewLoading ? '...' : overview?.open_reports ?? 0}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/30 p-4 space-y-1">
          <div className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">Verified</div>
          <div className="text-2xl font-extrabold text-emerald-300 font-mono">
            {overviewLoading ? '...' : overview?.verified_reports ?? 0}
          </div>
        </div>

        <div className="rounded-xl border border-blue-900/50 bg-blue-950/30 p-4 space-y-1">
          <div className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">Resolved</div>
          <div className="text-2xl font-extrabold text-blue-300 font-mono">
            {overviewLoading ? '...' : overview?.resolved_reports ?? 0}
          </div>
        </div>

        <div className="rounded-xl border border-amber-900/50 bg-amber-950/30 p-4 space-y-1">
          <div className="text-[11px] text-amber-400 font-semibold uppercase tracking-wider flex items-center space-x-1">
            <Sparkles className="h-3 w-3" />
            <span>Hotspots</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-mono">
            {overviewLoading ? '...' : overview?.hotspot_count ?? 0}
          </div>
        </div>

        <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-4 space-y-1">
          <div className="text-[11px] text-red-400 font-semibold uppercase tracking-wider flex items-center space-x-1">
            <Flame className="h-3 w-3" />
            <span>High Priority</span>
          </div>
          <div className="text-2xl font-extrabold text-red-300 font-mono">
            {overviewLoading ? '...' : overview?.high_priority_count ?? 0}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('triage')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'triage'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/40'
          }`}
        >
          <Flame className="h-4 w-4 text-cyan-400" />
          <span>Priority Triage Queue</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'audit'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/40'
          }`}
        >
          <History className="h-4 w-4 text-cyan-400" />
          <span>Audit Logs ({auditLogs?.length ?? 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('flags')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
            activeTab === 'flags'
              ? 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/40'
          }`}
        >
          <Flag className="h-4 w-4 text-cyan-400" />
          <span>Moderation Flags ({flags?.length ?? 0})</span>
        </button>
      </div>

      {/* TRIAGE QUEUE TAB */}
      {activeTab === 'triage' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-400 font-semibold pr-2 border-r border-slate-800">
              <Filter className="h-3.5 w-3.5 text-cyan-400" />
              <span>Queue Filters:</span>
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
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
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="">All Verifications</option>
              <option value="UNVERIFIED">Unverified</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ADMIN_VERIFIED">Admin Verified</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Priority Reasons Modal / Popover */}
          {selectedReasons && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 max-w-md w-full space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center space-x-1.5">
                    <Flame className="h-4 w-4 text-cyan-400" />
                    <span>Priority Score Calculation Reasons</span>
                  </h3>
                  <button
                    onClick={() => setSelectedReasons(null)}
                    className="text-slate-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <ul className="space-y-2 text-xs text-slate-300">
                  {selectedReasons.reasons.map((r, idx) => (
                    <li key={idx} className="flex items-start space-x-2 bg-slate-950 p-2.5 rounded border border-slate-800">
                      <CheckCircle2 className="h-3.5 w-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setSelectedReasons(null)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Triage Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
            {reportsLoading ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <div className="h-5 w-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs">Loading triage queue...</p>
              </div>
            ) : reportsData && reportsData.items.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs space-y-1">
                <Info className="h-6 w-6 text-slate-600 mx-auto" />
                <p>No civic reports currently matching filter criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Issue Details</th>
                      <th className="py-3 px-4">Category / Severity</th>
                      <th className="py-3 px-4">Verification</th>
                      <th className="py-3 px-4">Lifecycle Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reportsData?.items.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-950/40 transition-colors">
                        {/* Priority Score Column */}
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => setSelectedReasons({ id: report.id, reasons: report.priority_reasons })}
                            className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border font-mono font-bold text-xs ${getPriorityBadgeClass(report.priority_level)}`}
                            title="Click to view priority reasons"
                          >
                            <span>{report.priority_score}</span>
                            <span className="text-[10px]">({report.priority_level})</span>
                          </button>
                        </td>

                        {/* Title & Description */}
                        <td className="py-3.5 px-4 space-y-0.5 max-w-xs">
                          <Link
                            to={`/reports/${report.id}`}
                            className="font-bold text-white hover:text-cyan-300 transition-colors block line-clamp-1 text-xs"
                          >
                            {report.title}
                          </Link>
                          <div className="text-[11px] text-slate-400 line-clamp-1">{report.description}</div>
                          <div className="text-[10px] text-slate-500">By {report.user_name || 'Citizen'} • {new Date(report.created_at).toLocaleDateString()}</div>
                        </td>

                        {/* Category / Severity */}
                        <td className="py-3.5 px-4 space-y-1">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[10px] font-semibold uppercase">
                            {report.category.replace('_', ' ')}
                          </span>
                          <div className="text-[11px] font-semibold text-amber-400">{report.severity}</div>
                        </td>

                        {/* Verification Status Dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={report.verification_status}
                            onChange={(e) => handleVerifyChange(report.id, e.target.value)}
                            disabled={verifyMutation.isPending}
                            className={`rounded-lg border px-2.5 py-1 text-[11px] font-semibold focus:outline-none ${
                              report.verification_status === 'ADMIN_VERIFIED'
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : report.verification_status === 'REJECTED'
                                ? 'bg-red-950 text-red-300 border-red-800'
                                : 'bg-slate-950 text-amber-300 border-amber-800'
                            }`}
                          >
                            <option value="UNVERIFIED">UNVERIFIED</option>
                            <option value="UNDER_REVIEW">UNDER REVIEW</option>
                            <option value="ADMIN_VERIFIED">ADMIN VERIFIED</option>
                            <option value="REJECTED">REJECTED</option>
                          </select>
                        </td>

                        {/* Lifecycle Status Dropdown */}
                        <td className="py-3.5 px-4">
                          <select
                            value={report.status}
                            onChange={(e) => handleStatusChange(report.id, e.target.value)}
                            disabled={statusMutation.isPending}
                            className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-200 focus:outline-none"
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
                            className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold"
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2">
            <History className="h-4 w-4 text-cyan-400" />
            <span>Administrative Audit Log Records</span>
          </h3>

          {auditLoading ? (
            <div className="p-6 text-center text-slate-400 text-xs">Loading audit logs...</div>
          ) : auditLogs && auditLogs.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">No admin actions recorded yet.</div>
          ) : (
            <div className="space-y-2">
              {auditLogs?.map((log) => (
                <div key={log.id} className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-cyan-300 font-mono">{log.action}</span>
                    <div className="text-[11px] text-slate-400">
                      Entity: {log.entity_type} ({log.entity_id || 'N/A'})
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 shadow-xl">
          <h3 className="font-bold text-white text-sm flex items-center space-x-2">
            <Flag className="h-4 w-4 text-amber-400" />
            <span>Citizen Moderation Flags</span>
          </h3>

          {flagsLoading ? (
            <div className="p-6 text-center text-slate-400 text-xs">Loading moderation flags...</div>
          ) : flags && flags.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">No moderation flags reported.</div>
          ) : (
            <div className="space-y-2">
              {flags?.map((flag) => (
                <div key={flag.id} className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-amber-300 uppercase font-mono">{flag.reason}</span>
                    <div className="text-[11px] text-slate-300">Details: {flag.details || 'No details provided'}</div>
                  </div>
                  <Link
                    to={`/reports/${flag.report_id}`}
                    className="inline-flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    <span>View Flagged Report</span>
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
