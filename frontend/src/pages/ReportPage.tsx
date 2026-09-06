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
  Upload
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

    if (file.size > 10 * 1024 * 1024) {
      setImageError('File size exceeds maximum limit of 10MB.');
      return;
    }

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
    <div className="mx-auto max-w-2xl space-y-6 font-sans text-[#1c1c18]">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-[#1c1c18] tracking-tight flex items-center space-x-2 font-headline">
          <PlusCircle className="h-6 w-6 text-[#2f685f]" />
          <span>Report an Issue</span>
        </h1>
        <p className="text-xs text-[#787770]">
          Tell us what you noticed in your community so local teams can take action.
        </p>
      </div>

      <div className="rounded-2xl border border-[#e5e2da] bg-[#f1eee7] p-6 md:p-8 space-y-6 shadow-sm">
        {formError && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-3.5 flex items-start space-x-2.5 text-xs text-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: WHAT HAPPENED? */}
          <div className="space-y-4 rounded-xl border border-[#e5e2da] bg-[#fcf9f2] p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#06291b] uppercase tracking-wider border-b border-[#e5e2da] pb-2 font-headline">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#06291b] text-white text-[11px] font-mono">1</span>
              <span>What happened?</span>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-[#484742] mb-1">
                Report Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Hazardous Pothole on Oak Street"
                className="w-full rounded-xl border border-[#d0cdc5] bg-[#f1eee7] px-4 py-2.5 text-sm text-[#1c1c18] placeholder-[#a3a097] focus:border-[#06291b] focus:outline-none focus:ring-1 focus:ring-[#06291b]"
                minLength={5}
                maxLength={255}
                required
              />
            </div>

            {/* Category & Severity Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#484742] mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ReportCategory)}
                  className="w-full rounded-xl border border-[#d0cdc5] bg-[#f1eee7] px-4 py-2.5 text-sm text-[#1c1c18] focus:outline-none"
                >
                  <option value="POTHOLE">Potholes & Roads</option>
                  <option value="GARBAGE">Garbage & Sanitation</option>
                  <option value="STREETLIGHT">Streetlights & Power</option>
                  <option value="WATER_LEAK">Water & Sewage</option>
                  <option value="DAMAGED_INFRASTRUCTURE">Damaged Infrastructure</option>
                  <option value="OTHER">Other Community Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#484742] mb-1">
                  Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as ReportSeverity)}
                  className="w-full rounded-xl border border-[#d0cdc5] bg-[#f1eee7] px-4 py-2.5 text-sm text-[#1c1c18] focus:outline-none"
                >
                  <option value="LOW">Low (Minor issue)</option>
                  <option value="MEDIUM">Medium (Moderate concern)</option>
                  <option value="HIGH">High (Urgent issue)</option>
                  <option value="CRITICAL">Critical (Immediate hazard)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-[#484742] mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you noticed and how long it has been present..."
                className="w-full rounded-xl border border-[#d0cdc5] bg-[#f1eee7] px-4 py-2.5 text-sm text-[#1c1c18] placeholder-[#a3a097] focus:border-[#06291b] focus:outline-none"
                minLength={10}
                maxLength={2000}
                required
              />
            </div>
          </div>

          {/* STEP 2: WHERE IS IT LOCATED? */}
          <div className="space-y-4 rounded-xl border border-[#e5e2da] bg-[#fcf9f2] p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#06291b] uppercase tracking-wider border-b border-[#e5e2da] pb-2 font-headline">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#06291b] text-white text-[11px] font-mono">2</span>
              <span>Where is it located?</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#484742] mb-1">
                Street Address or Landmark
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Oak Street and 4th Avenue Incline"
                className="w-full rounded-xl border border-[#d0cdc5] bg-[#f1eee7] px-4 py-2.5 text-sm text-[#1c1c18] placeholder-[#a3a097] focus:border-[#06291b] focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#484742]">GPS Location</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="flex items-center space-x-1 text-[#06291b] hover:underline font-semibold"
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
                    className="w-full rounded-xl border border-[#d0cdc5] bg-[#f1eee7] px-3.5 py-2 text-xs text-[#1c1c18] placeholder-[#a3a097]"
                    required
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-[#787770] font-mono">LAT</span>
                </div>
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value))}
                    placeholder="Longitude"
                    className="w-full rounded-xl border border-[#d0cdc5] bg-[#f1eee7] px-3.5 py-2 text-xs text-[#1c1c18] placeholder-[#a3a097]"
                    required
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-[#787770] font-mono">LNG</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: EVIDENCE & SUBMIT */}
          <div className="space-y-4 rounded-xl border border-[#e5e2da] bg-[#fcf9f2] p-4">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#06291b] uppercase tracking-wider border-b border-[#e5e2da] pb-2 font-headline">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#06291b] text-white text-[11px] font-mono">3</span>
              <span>Photo Evidence & Submission</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#484742] mb-1 uppercase tracking-wider">
                Photo Attachment (Optional, Max 10MB)
              </label>

              {imageError && (
                <div className="mb-2 rounded-lg border border-red-300 bg-red-50 p-2.5 text-xs text-red-800 flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <span>{imageError}</span>
                </div>
              )}

              {imagePreview ? (
                <div className="relative rounded-xl border border-[#d0cdc5] bg-[#f1eee7] p-2 overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Upload preview"
                    className="h-48 w-full object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-4 right-4 rounded-full bg-[#1c1c18]/80 hover:bg-red-800 p-1.5 text-white transition-colors"
                    title="Remove Image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="mt-2 flex items-center justify-between text-xs text-[#787770] px-2 py-1">
                    <span className="truncate">{selectedFile?.name}</span>
                    <span>{(selectedFile!.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-[#d0cdc5] hover:border-[#06291b] rounded-xl p-6 text-center space-y-2 cursor-pointer transition-colors bg-[#f1eee7]/50 block">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Camera className="h-8 w-8 text-[#787770] mx-auto" />
                  <div className="text-xs text-[#1c1c18] font-semibold">Click to select photo evidence</div>
                  <p className="text-[11px] text-[#787770]">Supports JPG, PNG, or WEBP up to 10MB</p>
                </label>
              )}

              {/* Upload Progress Bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-[#06291b] font-semibold">
                    <span>Uploading photo...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#e5e2da] overflow-hidden">
                    <div
                      className="h-full bg-[#06291b] transition-all duration-200"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center space-x-2 rounded-xl bg-[#06291b] hover:bg-[#0a3826] disabled:opacity-50 py-3.5 text-sm font-semibold text-white transition-all shadow-sm font-headline"
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

