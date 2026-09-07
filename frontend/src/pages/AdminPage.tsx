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
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Input';
import { StatusBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
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

import { useToast } from '../context/ToastContext';

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
  const toast = useToast();

  const handleVerifyChange = async (reportId: string, newVerificationStatus: string) => {
    try {
      await verifyMutation.mutateAsync({ reportId, verification_status: newVerificationStatus });
      toast.success(`Verification status updated to ${newVerificationStatus}.`);
    } catch (err: any) {
      toast.error(err.message || 'Unable to update verification status.');
    }
  };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    try {
      await statusMutation.mutateAsync({ reportId, status: newStatus });
      toast.success(`Report status updated to ${newStatus.replace('_', ' ')}.`);
    } catch (err: any) {
      toast.error(err.message || 'Unable to update report status.');
    }
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
    <div className="space-y-8 max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-12 py-8 lg:py-12 min-h-[calc(100vh-4.5rem)] font-sans text-[#1c1c18]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e5e2da] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1c1c18] tracking-tight flex items-center space-x-3 font-headline">
            <ShieldCheck className="h-8 w-8 text-[#2f685f]" />
            <span>Issues Requiring Attention</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#787770] pt-1">
            Municipal Review Workspace: Verify, prioritize, and manage community signal triage.
          </p>
        </div>

        <Button
          size="md"
          variant="secondary"
          onClick={() => refetch()}
          leftIcon={<RefreshCw className="h-4 w-4 text-[#2f685f]" />}
        >
          Refresh Data
        </Button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card variant="container" className="p-5 space-y-2 min-h-[110px] flex flex-col justify-between">
          <div className="text-[11px] text-[#787770] font-bold uppercase tracking-wider font-headline">Total Reports</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#1c1c18] font-mono">
            {overviewLoading ? '...' : overview?.total_reports ?? 0}
          </div>
        </Card>

        <Card variant="container" className="p-5 space-y-2 min-h-[110px] flex flex-col justify-between bg-sky-50/80 border-sky-200">
          <div className="text-[11px] text-sky-900 font-bold uppercase tracking-wider font-headline">Open Reports</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-sky-900 font-mono">
            {overviewLoading ? '...' : overview?.open_reports ?? 0}
          </div>
        </Card>

        <Card variant="container" className="p-5 space-y-2 min-h-[110px] flex flex-col justify-between bg-[#e1f3ee] border-[#a2d8cb]">
          <div className="text-[11px] text-[#06291b] font-bold uppercase tracking-wider font-headline">Verified</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#06291b] font-mono">
            {overviewLoading ? '...' : overview?.verified_reports ?? 0}
          </div>
        </Card>

        <Card variant="container" className="p-5 space-y-2 min-h-[110px] flex flex-col justify-between bg-[#e1f3ee] border-[#a2d8cb]">
          <div className="text-[11px] text-[#06291b] font-bold uppercase tracking-wider font-headline">Resolved</div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#06291b] font-mono">
            {overviewLoading ? '...' : overview?.resolved_reports ?? 0}
          </div>
        </Card>

        <Card variant="container" className="p-5 space-y-2 min-h-[110px] flex flex-col justify-between bg-amber-50/80 border-amber-200">
          <div className="text-[11px] text-amber-900 font-bold uppercase tracking-wider font-headline flex items-center space-x-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-700" />
            <span>Hotspots</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-900 font-mono">
            {overviewLoading ? '...' : overview?.hotspot_count ?? 0}
          </div>
        </Card>

        <Card variant="container" className="p-5 space-y-2 min-h-[110px] flex flex-col justify-between bg-red-50/80 border-red-200">
          <div className="text-[11px] text-red-900 font-bold uppercase tracking-wider font-headline flex items-center space-x-1">
            <AlertCircle className="h-3.5 w-3.5 text-red-700" />
            <span>High Priority</span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-red-900 font-mono">
            {overviewLoading ? '...' : overview?.high_priority_count ?? 0}
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-[#e5e2da] pb-3">
        <Button
          size="sm"
          variant={activeTab === 'triage' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('triage')}
          leftIcon={<AlertCircle className="h-4 w-4" />}
        >
          Priority Queue
        </Button>

        <Button
          size="sm"
          variant={activeTab === 'audit' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('audit')}
          leftIcon={<History className="h-4 w-4" />}
        >
          Audit Records ({auditLogs?.length ?? 0})
        </Button>

        <Button
          size="sm"
          variant={activeTab === 'flags' ? 'primary' : 'secondary'}
          onClick={() => setActiveTab('flags')}
          leftIcon={<Flag className="h-4 w-4" />}
        >
          Moderation Flags ({flags?.length ?? 0})
        </Button>
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

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-auto py-1 px-3 text-xs"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="VERIFIED">Verified</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
            </Select>

            <Select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="w-auto py-1 px-3 text-xs"
            >
              <option value="">All Verifications</option>
              <option value="UNVERIFIED">Unverified</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="ADMIN_VERIFIED">Verified</option>
              <option value="REJECTED">Rejected</option>
            </Select>

            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-auto py-1 px-3 text-xs"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </Select>
          </div>

          {/* Priority Reasons Modal */}
          <Modal
            isOpen={!!selectedReasons}
            onClose={() => setSelectedReasons(null)}
            title="Priority Score Context"
            subtitle="Calculated weighting factors driving issue priority ranking"
            footer={
              <Button size="sm" className="w-full" onClick={() => setSelectedReasons(null)}>
                Close Context
              </Button>
            }
          >
            {selectedReasons && (
              <ul className="space-y-2 text-xs text-[#484742]">
                {selectedReasons.reasons.map((r, idx) => (
                  <li key={idx} className="flex items-start space-x-2 bg-[#f1eee7] p-2.5 rounded-xl border border-[#e5e2da]">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#2f685f] flex-shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            )}
          </Modal>

          {/* Triage Table */}
          <div className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] overflow-hidden shadow-xs">
            {reportsLoading ? (
              <div className="p-12 text-center text-[#787770] space-y-2">
                <div className="h-5 w-5 rounded-full border-2 border-[#06291b] border-t-transparent animate-spin mx-auto" />
                <p className="text-xs">Loading review queue...</p>
              </div>
            ) : reportsData && reportsData.items.length === 0 ? (
              <EmptyState
                icon={Info}
                title="No reports matching filter criteria"
                description="No community submissions currently match your selected triage filters."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-[#1c1c18]">
                  <thead className="bg-[#e5e2da] text-[#484742] font-semibold uppercase text-[10px] tracking-wider border-b border-[#d0cdc5] font-headline">
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
                            title="Click to view priority breakdown"
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
                          <span className="inline-block px-2 py-0.5 rounded bg-[#fcf9f2] text-[#484742] border border-[#e5e2da] text-[10px] font-bold uppercase font-headline">
                            {report.category.replace('_', ' ')}
                          </span>
                          <StatusBadge severity={report.severity} size="sm" />
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
                            className="inline-flex items-center space-x-1 text-[#06291b] hover:underline text-xs font-bold"
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
        <Card variant="container" className="space-y-4">
          <h3 className="font-bold text-[#1c1c18] text-sm flex items-center space-x-2 font-headline">
            <History className="h-4 w-4 text-[#2f685f]" />
            <span>Audit Activity Log</span>
          </h3>

          {auditLoading ? (
            <div className="p-6 text-center text-[#787770] text-xs">Loading audit records...</div>
          ) : auditLogs && auditLogs.length === 0 ? (
            <EmptyState
              icon={History}
              title="No activity recorded yet"
              description="No administrative actions have been logged in the platform audit history."
            />
          ) : (
            <div className="space-y-2">
              {auditLogs?.map((log) => (
                <div key={log.id} className="rounded-xl border border-[#e5e2da] bg-[#fcf9f2] p-3 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <span className="font-bold text-[#06291b] font-mono">{log.action}</span>
                    <div className="text-[11px] text-[#787770]">
                      Entity: {log.entity_type}
                    </div>
                  </div>
                  <div className="text-[10px] text-[#787770] font-mono">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* MODERATION FLAGS TAB */}
      {activeTab === 'flags' && (
        <Card variant="container" className="space-y-4">
          <h3 className="font-bold text-[#1c1c18] text-sm flex items-center space-x-2 font-headline">
            <Flag className="h-4 w-4 text-amber-700" />
            <span>Moderation Flags</span>
          </h3>

          {flagsLoading ? (
            <div className="p-6 text-center text-[#787770] text-xs">Loading moderation flags...</div>
          ) : flags && flags.length === 0 ? (
            <EmptyState
              icon={Flag}
              title="No moderation flags recorded"
              description="No community reports have been flagged for moderation review."
            />
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
                    className="inline-flex items-center space-x-1 text-[#06291b] hover:underline font-bold"
                  >
                    <span>View Case</span>
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
