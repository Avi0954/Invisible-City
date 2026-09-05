import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateReport, useUploadMedia } from '../hooks/useReports';
import { ReportCategory, ReportSeverity } from '../types/report';
import {
  PlusCircle,
  MapPin,
  Camera,
  AlertTriangle,
  X,
  CheckCircle2,
  Upload,
  Layers
} from 'lucide-react';

export const ReportPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReportCategory>('POTHOLE');
  const [severity, setSeverity] = useState<ReportSeverity>('MEDIUM');
  const [latitude, setLatitude] = useState<number>(12.9716); // Default Bengaluru lat
  const [longitude, setLongitude] = useState<number>(77.5946); // Default Bengaluru lng
  const [address, setAddress] = useState('');

  // Image Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [imageError, setImageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const createReportMutation = useCreateReport();
  const uploadMediaMutation = useUploadMedia();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImageError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setImageError('File size exceeds maximum limit of 10MB.');
      return;
    }

    // Validate MIME type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setImageError('Invalid image format. Allowed formats: JPG, PNG, WEBP.');
      return;
    }

    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setImageError(null);
    setUploadProgress(0);
  };

  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(Number(position.coords.latitude.toFixed(6)));
          setLongitude(Number(position.coords.longitude.toFixed(6)));
        },
        () => {
          setFormError('Could not retrieve current location. Please enter coordinates manually.');
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      // 1. Create Report
      const newReport = await createReportMutation.mutateAsync({
        title,
        description,
        category,
        severity,
        latitude,
        longitude,
        address: address || undefined,
      });

      // 2. Upload Attached Image if selected
      if (selectedFile) {
        await uploadMediaMutation.mutateAsync({
          reportId: newReport.id,
          file: selectedFile,
          onProgress: (percent) => setUploadProgress(percent),
        });
      }

      navigate(`/reports/${newReport.id}`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit report. Please try again.');
    }
  };

  const isSubmitting = createReportMutation.isPending || uploadMediaMutation.isPending;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
          <PlusCircle className="h-6 w-6 text-cyan-400" />
          <span>Report an Urban Infrastructure Problem</span>
        </h1>
        <p className="text-xs text-slate-400">
          Provide problem details and spatial location to log your report for municipal action.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 space-y-6 shadow-xl backdrop-blur-sm">
        {formError && (
          <div className="rounded-xl border border-red-800/80 bg-red-950/60 p-3.5 flex items-start space-x-2.5 text-xs text-red-300">
            <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: WHAT HAPPENED? */}
          <div className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cyan-950 text-cyan-300 text-[11px] font-mono">1</span>
              <span>What happened?</span>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Large Hazardous Pothole on 5th Main"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                minLength={5}
                maxLength={255}
                required
              />
            </div>

            {/* Category & Severity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="POTHOLE">Road & Pothole Damage</option>
                  <option value="GARBAGE">Garbage & Waste Accumulation</option>
                  <option value="STREETLIGHT">Broken Streetlight</option>
                  <option value="WATER_LEAK">Water Main Leak / Sewage</option>
                  <option value="DAMAGED_INFRASTRUCTURE">Damaged Footpath / Infrastructure</option>
                  <option value="OTHER">Other Urban Problem</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Impact Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as ReportSeverity)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="LOW">Low (Minor annoyance)</option>
                  <option value="MEDIUM">Medium (Moderate traffic/safety risk)</option>
                  <option value="HIGH">High (Urgent safety hazard)</option>
                  <option value="CRITICAL">Critical (Immediate danger to life)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Description & Context
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide context regarding the issue size, hazard level, and exact spot..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                minLength={10}
                maxLength={2000}
                required
              />
            </div>
          </div>

          {/* STEP 2: WHERE IS IT LOCATED? */}
          <div className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-sky-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-sky-950 text-sky-300 text-[11px] font-mono">2</span>
              <span>Where is it located?</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Location Landmark Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Landmark address (e.g. Near Indiranagar Metro Station, Bengaluru)"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300">GPS Coordinates</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300 font-semibold"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Auto-Detect Location</span>
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value))}
                    placeholder="Latitude"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500"
                    required
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono">LAT</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    placeholder="Longitude"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500"
                    required
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-slate-500 font-mono">LNG</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: EVIDENCE & SUBMIT */}
          <div className="space-y-4 rounded-xl border border-slate-800/80 bg-slate-950/40 p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950 text-emerald-300 text-[11px] font-mono">3</span>
              <span>Evidence & Submission</span>
            </div>


          {/* Image Upload Area with Preview, Progress & Error */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wider">
              Photo Attachment (Optional, Max 10MB)
            </label>

            {imageError && (
              <div className="mb-2 rounded-lg border border-red-800 bg-red-950/60 p-2.5 text-xs text-red-300 flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>{imageError}</span>
              </div>
            )}

            {imagePreview ? (
              <div className="relative rounded-xl border border-slate-700 bg-slate-950 p-2 overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Upload preview"
                  className="h-48 w-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-4 right-4 rounded-full bg-slate-950/80 hover:bg-red-900 p-1.5 text-white transition-colors"
                  title="Remove Image"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400 px-2 py-1">
                  <span className="truncate">{selectedFile?.name}</span>
                  <span>{(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
            ) : (
              <label className="border-2 border-dashed border-slate-800 hover:border-cyan-600/80 rounded-xl p-6 text-center space-y-2 cursor-pointer transition-colors bg-slate-950/40 block">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Camera className="h-8 w-8 text-slate-500 mx-auto" />
                <div className="text-xs text-slate-300 font-semibold">Click to select photo evidence</div>
                <p className="text-[11px] text-slate-500">Supports JPG, PNG, or WEBP up to 10MB</p>
              </label>
            )}

            {/* Upload Progress Bar */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-[11px] text-cyan-400">
                  <span>Uploading image...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-cyan-500 transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center space-x-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-950/80 transition-all"
          >
            {isSubmitting ? (
              <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            ) : (
              <>
                <PlusCircle className="h-4 w-4" />
                <span>Submit Report</span>
              </>
            )}
          </button>
          </div>
        </form>

      </div>
    </div>
  );
};
