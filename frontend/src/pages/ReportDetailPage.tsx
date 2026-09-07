import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useReport, useDeleteReport, useUploadMedia, useDeleteMedia } from '../hooks/useReports';
import { useReportAnalysis, useAnalyzeReport } from '../hooks/useAIAnalysis';
import { useRelatedReports, useDuplicateReports } from '../hooks/useIntelligence';
import { useFlagReport } from '../hooks/useAdmin';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { ReportTimeline } from '../components/ui/ReportTimeline';
import { Select, Textarea } from '../components/ui/Input';
import {
  MapPin,
  Clock,
  User,
  Trash2,
  Upload,
  ArrowLeft,
  AlertCircle,
  X,
  Sparkles,
  Tag,
  RefreshCw,
  Copy,
  GitCompare,
  ExternalLink,
  Flag
} from 'lucide-react';

import { useToast } from '../context/ToastContext';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const toast = useToast();

  const { data: report, isLoading, isError } = useReport(id!);
  const { data: aiAnalysis } = useReportAnalysis(id!);
  const { data: relatedData } = useRelatedReports(id!);
  const { data: duplicateData } = useDuplicateReports(id!);

  const triggerAnalysisMutation = useAnalyzeReport();
  const deleteReportMutation = useDeleteReport();
  const uploadMediaMutation = useUploadMedia();
  const deleteMediaMutation = useDeleteMedia();
  const flagMutation = useFlagReport();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [flagModalOpen, setFlagModalOpen] = useState(false);
  const [flagReason, setFlagReason] = useState('FALSE_REPORT');
  const [flagDetails, setFlagDetails] = useState('');
  const [flagSuccess, setFlagSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className="p-16 text-center text-[#787770] space-y-3 font-sans">
        <div className="h-6 w-6 rounded-full border-2 border-[#06291b] border-t-transparent animate-spin mx-auto" />
        <p className="text-xs">Loading report case details...</p>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="space-y-4 max-w-lg mx-auto text-center py-16 font-sans">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-800 space-y-2">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" />
          <h3 className="font-bold text-base font-headline">Report Case Not Found</h3>
          <p className="text-xs">The requested civic report does not exist or has been removed.</p>
        </div>
        <Link to="/my-reports" className="text-xs text-[#06291b] font-bold hover:underline">
          Return to My Reports
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === report.user_id;
  const canModify = isOwner || isAdmin;

  const handleDeleteReport = async () => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        await deleteReportMutation.mutateAsync(report.id);
        toast.success('Report deleted successfully.');
        navigate('/my-reports');
      } catch (err: any) {
        toast.error(err.message || 'Unable to delete report.');
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB.');
      toast.error('File size exceeds 10MB.');
      return;
    }

    setUploading(true);
    try {
      await uploadMediaMutation.mutateAsync({ reportId: report.id, file });
      toast.success('Photo attachment uploaded successfully.');
    } catch (err: any) {
      const msg = err.message || 'Failed to upload media attachment.';
      setUploadError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (window.confirm('Remove this photo attachment?')) {
      try {
        await deleteMediaMutation.mutateAsync({ mediaId, reportId: report.id });
        toast.success('Photo attachment removed.');
      } catch (err: any) {
        toast.error(err.message || 'Unable to remove photo attachment.');
      }
    }
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await flagMutation.mutateAsync({ reportId: report.id, reason: flagReason, details: flagDetails });
      setFlagSuccess(true);
      toast.success('Flag submitted for community moderation.');
      setTimeout(() => {
        setFlagModalOpen(false);
        setFlagSuccess(false);
      }, 1500);
    } catch (err: any) {
      toast.error(err.message || 'Unable to submit moderation flag.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8 font-sans text-[#1c1c18]">
      {/* Back Navigation & Case Actions */}
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFlagModalOpen(true)}
            leftIcon={<Flag className="h-3.5 w-3.5 text-amber-700" />}
          >
            Flag Issue
          </Button>

          {canModify && (
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDeleteReport}
              leftIcon={<Trash2 className="h-3.5 w-3.5" />}
            >
              Delete Report
            </Button>
          )}
        </div>
      </div>

      {/* Flag Moderation Modal */}
      <Modal
        isOpen={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        title="Flag Report for Moderation"
        subtitle="Submit a moderation report for reviewer evaluation"
      >
        {flagSuccess ? (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs text-emerald-900 text-center font-semibold">
            ✓ Flag submitted for community moderation.
          </div>
        ) : (
          <form onSubmit={handleFlagSubmit} className="space-y-4 text-xs">
            <Select
              label="Flag Reason"
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
            >
              <option value="FALSE_REPORT">False or Spam Report</option>
              <option value="DUPLICATE">Duplicate of Existing Report</option>
              <option value="INCORRECT_LOCATION">Incorrect GPS Location</option>
              <option value="INAPPROPRIATE_CONTENT">Inappropriate Content</option>
              <option value="ALREADY_RESOLVED">Already Resolved Issue</option>
            </Select>

            <Textarea
              label="Additional Details (Optional)"
              value={flagDetails}
              onChange={(e) => setFlagDetails(e.target.value)}
              placeholder="Provide additional context..."
              rows={3}
            />

            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => setFlagModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" variant="accent" isLoading={flagMutation.isPending}>
                Submit Flag
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Main Details Card */}
      <Card variant="container" className="shadow-sm space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={report.status} />
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e5e2da] text-[#484742] uppercase tracking-wider font-headline">
              {report.category.replace('_', ' ')}
            </span>
            <StatusBadge severity={report.severity} />
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1c1c18] tracking-tight font-headline">{report.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#787770]">
            <div className="flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 text-[#2f685f]" />
              <span>Reported by {report.user_name || 'Resident'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5 text-[#2f685f]" />
              <span>{new Date(report.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Visual Report Progress Timeline */}
        <div className="border-t border-[#d0cdc5] pt-4">
          <ReportTimeline status={report.status} verificationStatus={report.verification_status} />
        </div>

        {/* Description Section */}
        <div className="space-y-2 border-t border-[#d0cdc5] pt-4">
          <h3 className="text-xs font-bold text-[#787770] uppercase tracking-wider font-headline">Description</h3>
          <p className="text-sm text-[#1c1c18] leading-relaxed whitespace-pre-line font-sans">{report.description}</p>
        </div>

        {/* Automated Report Analysis Section */}
        <div className="space-y-3 border-t border-[#d0cdc5] pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#787770] uppercase tracking-wider flex items-center space-x-1.5 font-headline">
              <Sparkles className="h-4 w-4 text-[#2f685f]" />
              <span>Signal Analysis Layer</span>
            </h3>

            {(!aiAnalysis || aiAnalysis.processing_status === 'FAILED') && (
              <Button
                size="sm"
                variant="accent"
                isLoading={triggerAnalysisMutation.isPending}
                onClick={() => triggerAnalysisMutation.mutate(report.id)}
                leftIcon={triggerAnalysisMutation.isPending ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              >
                {aiAnalysis?.processing_status === 'FAILED' ? 'Retry Analysis' : 'Run Signal Analysis'}
              </Button>
            )}
          </div>

          {!aiAnalysis && (
            <p className="text-xs text-[#787770] italic">
              Automated signal analysis has not been run for this report case. Click button above to queue analysis.
            </p>
          )}

          {aiAnalysis && (aiAnalysis.processing_status === 'PENDING' || aiAnalysis.processing_status === 'PROCESSING') && (
            <div className="rounded-xl border border-[#a2d8cb] bg-[#e1f3ee] p-4 flex items-center space-x-3 text-xs text-[#06291b]">
              <div className="h-4 w-4 rounded-full border-2 border-[#06291b] border-t-transparent animate-spin flex-shrink-0" />
              <span>Analyzing report context...</span>
            </div>
          )}

          {aiAnalysis && (aiAnalysis.processing_status === 'COMPLETED' || aiAnalysis.processing_status === 'REVIEW_REQUIRED') && (
            <div className="rounded-xl border border-[#e5e2da] bg-[#fcf9f2] p-5 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-[#e5e2da] pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#e1f3ee] text-[#06291b] border border-[#a2d8cb]">
                    Category: {aiAnalysis.category?.replace('_', ' ')}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#e5e2da] text-[#1c1c18]">
                    Severity: {aiAnalysis.severity}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#484742]">
                  <span>Confidence:</span>
                  <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-[#e1f3ee] text-[#06291b] border border-[#a2d8cb]">
                    {((aiAnalysis.confidence || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              {aiAnalysis.summary && (
                <div className="space-y-1 text-xs">
                  <span className="text-[#787770] font-bold uppercase tracking-wider text-[10px]">Context Summary</span>
                  <p className="text-[#1c1c18] leading-relaxed italic">"{aiAnalysis.summary}"</p>
                </div>
              )}

              {aiAnalysis.keywords && aiAnalysis.keywords.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-[#787770] font-bold uppercase tracking-wider text-[10px]">Keywords</span>
                  <div className="flex flex-wrap gap-1.5">
                    {aiAnalysis.keywords.map((kw, idx) => (
                      <span key={idx} className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-lg bg-[#f1eee7] text-[11px] text-[#2f685f] border border-[#d0cdc5]">
                        <Tag className="h-3 w-3 text-[#2f685f]" />
                        <span>{kw}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Possible Duplicates Section */}
        <div className="space-y-3 border-t border-[#d0cdc5] pt-4">
          <h3 className="text-xs font-bold text-[#787770] uppercase tracking-wider flex items-center space-x-1.5 font-headline">
            <Copy className="h-4 w-4 text-[#787770]" />
            <span>Possible Duplicates ({duplicateData ? duplicateData.count : 0})</span>
          </h3>

          {duplicateData && duplicateData.duplicates.length > 0 ? (
            <div className="space-y-2">
              {duplicateData.duplicates.map((dup) => (
                <div key={dup.id} className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950 flex items-center space-x-1.5">
                      <span>Possible Duplicate Report</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-amber-200 text-amber-900 font-mono">
                        {(dup.score * 100).toFixed(0)}% match
                      </span>
                    </span>
                    <Link
                      to={`/reports/${dup.related_report_id}`}
                      className="inline-flex items-center space-x-1 text-[#06291b] hover:underline font-bold"
                    >
                      <span>View Case</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <p className="text-amber-900 text-[11px] leading-relaxed">{dup.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#787770] italic">No duplicate reports detected.</p>
          )}
        </div>

        {/* Related Reports Section */}
        <div className="space-y-3 border-t border-[#d0cdc5] pt-4">
          <h3 className="text-xs font-bold text-[#787770] uppercase tracking-wider flex items-center space-x-1.5 font-headline">
            <GitCompare className="h-4 w-4 text-[#2f685f]" />
            <span>Connected Reports ({relatedData ? relatedData.count : 0})</span>
          </h3>

          {relatedData && relatedData.related_reports.length > 0 ? (
            <div className="space-y-2">
              {relatedData.related_reports.map((rel) => (
                <div key={rel.id} className="rounded-xl border border-[#e5e2da] bg-[#fcf9f2] p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1c1c18] flex items-center space-x-1.5">
                      <span>Related Community Report</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#e1f3ee] text-[#06291b] border border-[#a2d8cb] font-mono">
                        {(rel.score * 100).toFixed(0)}% similarity
                      </span>
                    </span>
                    <Link
                      to={`/reports/${rel.related_report_id}`}
                      className="inline-flex items-center space-x-1 text-[#06291b] hover:underline font-bold"
                    >
                      <span>View Case</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <p className="text-[#484742] text-[11px] leading-relaxed">{rel.explanation}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#787770] italic">No related reports found.</p>
          )}
        </div>

        {/* Location Details */}
        <div className="space-y-2 border-t border-[#d0cdc5] pt-4">
          <h3 className="text-xs font-bold text-[#787770] uppercase tracking-wider font-headline">Location</h3>
          <div className="rounded-xl border border-[#e5e2da] bg-[#fcf9f2] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start space-x-2 text-[#1c1c18]">
              <MapPin className="h-4 w-4 text-[#2f685f] flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#1c1c18]">{report.address || 'Specified Location'}</div>
                <div className="text-[#787770] font-mono text-[11px]">
                  {report.latitude}, {report.longitude}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media Attachments Gallery */}
        <div className="space-y-3 border-t border-[#d0cdc5] pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-[#787770] uppercase tracking-wider font-headline">
              Photo Evidence ({report.media.length})
            </h3>
            {canModify && (
              <label className="inline-flex items-center space-x-1 text-xs text-[#06291b] hover:underline cursor-pointer font-semibold">
                <Upload className="h-3.5 w-3.5" />
                <span>Add Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {uploadError && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-2.5 text-xs text-red-800 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploading && (
            <div className="text-xs text-[#06291b] animate-pulse flex items-center space-x-2 font-semibold">
              <div className="h-3 w-3 rounded-full border-2 border-[#06291b] border-t-transparent animate-spin" />
              <span>Uploading photo...</span>
            </div>
          )}

          {report.media.length === 0 ? (
            <p className="text-xs text-[#787770] italic">No photo evidence attached to this report.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
              {report.media.map((item) => (
                <div key={item.id} className="relative group rounded-xl border border-[#e5e2da] bg-[#fcf9f2] overflow-hidden">
                  <img
                    src={item.media_url}
                    alt="Report evidence"
                    className="h-48 w-full object-cover"
                  />
                  {canModify && (
                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      className="absolute top-2 right-2 rounded-full bg-[#1c1c18]/80 hover:bg-red-800 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Photo"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
