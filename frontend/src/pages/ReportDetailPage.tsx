import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useReport, useDeleteReport, useUploadMedia, useDeleteMedia } from '../hooks/useReports';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  Trash2,
  Upload,
  ArrowLeft,
  AlertCircle,
  Camera,
  CheckCircle2,
  X
} from 'lucide-react';

export const ReportDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const { data: report, isLoading, isError } = useReport(id!);
  const deleteReportMutation = useDeleteReport();
  const uploadMediaMutation = useUploadMedia();
  const deleteMediaMutation = useDeleteMedia();

  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400 space-y-3">
        <div className="h-6 w-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
        <p className="text-xs">Loading report details...</p>
      </div>
    );
  }

  if (isError || !report) {
    return (
      <div className="space-y-4 max-w-lg mx-auto text-center py-12">
        <div className="rounded-xl border border-red-800 bg-red-950/60 p-6 text-red-300 space-y-2">
          <AlertCircle className="h-8 w-8 text-red-400 mx-auto" />
          <h3 className="font-bold text-base">Report Not Found</h3>
          <p className="text-xs">The requested civic report does not exist or has been removed.</p>
        </div>
        <Link to="/my-reports" className="text-xs text-cyan-400 hover:underline">
          Return to My Reports
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === report.user_id;
  const canModify = isOwner || isAdmin;

  const handleDeleteReport = async () => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      await deleteReportMutation.mutateAsync(report.id);
      navigate('/my-reports');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size exceeds 10MB.');
      return;
    }

    setUploading(true);
    try {
      await uploadMediaMutation.mutateAsync({ reportId: report.id, file });
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload media attachment.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (window.confirm('Remove this photo attachment?')) {
      await deleteMediaMutation.mutateAsync({ mediaId, reportId: report.id });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center space-x-1 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        {canModify && (
          <button
            onClick={handleDeleteReport}
            className="inline-flex items-center space-x-1.5 rounded-lg border border-red-900 bg-red-950/60 hover:bg-red-900 px-3 py-1.5 text-xs font-semibold text-red-300 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete Report</span>
          </button>
        )}
      </div>

      {/* Main Details Card */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 space-y-6 shadow-xl">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
              {report.status}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-950 text-slate-300 border border-slate-800 uppercase tracking-wider">
              {report.category.replace('_', ' ')}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
              {report.severity} Severity
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{report.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
            <div className="flex items-center space-x-1.5">
              <User className="h-3.5 w-3.5 text-cyan-400" />
              <span>Reported by {report.user_name || 'Citizen'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Clock className="h-3.5 w-3.5 text-cyan-400" />
              <span>{new Date(report.created_at).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2 border-t border-slate-800/80 pt-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</h3>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">{report.description}</p>
        </div>

        {/* Spatial Location Details */}
        <div className="space-y-2 border-t border-slate-800/80 pt-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Spatial Location</h3>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start space-x-2 text-slate-300">
              <MapPin className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-white">{report.address || 'Specified GPS Location'}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Coordinates: {report.latitude}, {report.longitude}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Media Attachments Gallery */}
        <div className="space-y-3 border-t border-slate-800/80 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Photo Attachments ({report.media.length})
            </h3>
            {canModify && (
              <label className="inline-flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 cursor-pointer font-medium">
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
            <div className="rounded-lg border border-red-800 bg-red-950/60 p-2.5 text-xs text-red-300 flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span>{uploadError}</span>
            </div>
          )}

          {uploading && (
            <div className="text-xs text-cyan-400 animate-pulse flex items-center space-x-2">
              <div className="h-3 w-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
              <span>Uploading attachment...</span>
            </div>
          )}

          {report.media.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No photo evidence attached to this report.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
              {report.media.map((item) => (
                <div key={item.id} className="relative group rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                  <img
                    src={item.media_url}
                    alt="Report attachment"
                    className="h-48 w-full object-cover"
                  />
                  {canModify && (
                    <button
                      onClick={() => handleDeleteMedia(item.id)}
                      className="absolute top-2 right-2 rounded-full bg-slate-950/80 hover:bg-red-900 p-1.5 text-white opacity-0 group-hover:opacity-100 transition-opacity"
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
      </div>
    </div>
  );
};
