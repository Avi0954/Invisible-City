import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useCreateReport, useUploadMedia } from '../hooks/useReports';
import { useToast } from '../context/ToastContext';
import { ReportCategory, ReportSeverity } from '../types/report';
import { Button } from '../components/ui/Button';
import { Input, Select, Textarea } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { ImageUploader } from '../components/reports/ImageUploader';
import {
  PlusCircle,
  MapPin,
  AlertTriangle,
  Crosshair,
  ArrowRight,
  ArrowLeft,
  Check
} from 'lucide-react';

// Custom Marker Icon for Location Picker Pin
const pickerMarkerIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <span class="absolute inline-flex h-8 w-8 rounded-full bg-[#06291b] opacity-25 animate-ping"></span>
      <div class="relative inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#06291b] border-2 border-white shadow-lg text-white font-bold text-xs font-mono">
        📍
      </div>
    </div>
  `,
  className: 'custom-picker-marker',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Helper component to handle map clicks, dragend & recentering
const LocationPickerMarker: React.FC<{
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}> = ({ position, onPositionChange }) => {
  const map = useMap();

  useMapEvents({
    click(e) {
      onPositionChange(
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6))
      );
    },
  });

  useEffect(() => {
    map.flyTo(position, map.getZoom(), { duration: 0.8 });
  }, [position, map]);

  return (
    <Marker
      position={position}
      icon={pickerMarkerIcon}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const latLng = marker.getLatLng();
          onPositionChange(
            Number(latLng.lat.toFixed(6)),
            Number(latLng.lng.toFixed(6))
          );
        },
      }}
    />
  );
};

export const ReportPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
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
  const toast = useToast();
  const navigate = useNavigate();

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      if (file.size > 10 * 1024 * 1024) {
        setImageError('File size exceeds maximum limit of 10MB.');
        return;
      }
      setImageError(null);
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
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
          const newLat = Number(position.coords.latitude.toFixed(6));
          const newLng = Number(position.coords.longitude.toFixed(6));
          setLatitude(newLat);
          setLongitude(newLng);
          toast.info('Map centered to your current location.');
        },
        () => {
          toast.error('Location access unavailable. Tap or drag the map marker to select location.');
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

      toast.success('Report submitted successfully.');
      navigate(`/reports/${newReport.id}`);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to submit report. Please try again.';
      setFormError(errMsg);
      toast.error(errMsg);
    }
  };

  const isSubmitting = createReportMutation.isPending || uploadMediaMutation.isPending;

  return (
    <div className="mx-auto max-w-[1440px] px-6 sm:px-8 lg:px-12 py-10 lg:py-16 space-y-8 font-sans text-[#1c1c18]">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1c1c18] tracking-tight flex items-center space-x-3 font-headline">
          <PlusCircle className="h-8 w-8 text-[#2f685f]" />
          <span>Report an Issue</span>
        </h1>
        <p className="text-sm text-[#787770]">
          Tell us what you noticed in your neighborhood so city teams can prioritize and resolve it.
        </p>
      </div>

      {/* 4-Step Progress Indicator */}
      <div className="grid grid-cols-4 gap-3 text-xs font-semibold font-headline">
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`p-3 rounded-2xl border flex items-center justify-center space-x-2 transition-all ${
            currentStep === 1
              ? 'bg-[#06291b] text-white border-[#06291b] shadow-xs'
              : currentStep > 1
              ? 'bg-[#e1f3ee] text-[#06291b] border-[#a2d8cb]'
              : 'bg-[#f1eee7] text-[#787770] border-[#e5e2da]'
          }`}
        >
          <span className="font-mono">01</span>
          <span>Issue</span>
        </button>

        <button
          type="button"
          onClick={() => title && description && setCurrentStep(2)}
          className={`p-3 rounded-2xl border flex items-center justify-center space-x-2 transition-all ${
            currentStep === 2
              ? 'bg-[#06291b] text-white border-[#06291b] shadow-xs'
              : currentStep > 2
              ? 'bg-[#e1f3ee] text-[#06291b] border-[#a2d8cb]'
              : 'bg-[#f1eee7] text-[#787770] border-[#e5e2da]'
          }`}
        >
          <span className="font-mono">02</span>
          <span>Location</span>
        </button>

        <button
          type="button"
          onClick={() => title && description && setCurrentStep(3)}
          className={`p-3 rounded-2xl border flex items-center justify-center space-x-2 transition-all ${
            currentStep === 3
              ? 'bg-[#06291b] text-white border-[#06291b] shadow-xs'
              : currentStep > 3
              ? 'bg-[#e1f3ee] text-[#06291b] border-[#a2d8cb]'
              : 'bg-[#f1eee7] text-[#787770] border-[#e5e2da]'
          }`}
        >
          <span className="font-mono">03</span>
          <span>Evidence</span>
        </button>

        <button
          type="button"
          onClick={() => title && description && setCurrentStep(4)}
          className={`p-3 rounded-2xl border flex items-center justify-center space-x-2 transition-all ${
            currentStep === 4
              ? 'bg-[#06291b] text-white border-[#06291b] shadow-xs'
              : 'bg-[#f1eee7] text-[#787770] border-[#e5e2da]'
          }`}
        >
          <span className="font-mono">04</span>
          <span>Review</span>
        </button>
      </div>

      {/* 2-Column Desktop Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        {/* Left Column: Form Steps */}
        <div className="lg:col-span-7">
          <Card variant="container" className="shadow-sm p-6 sm:p-8 space-y-6">
            {formError && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3.5 flex items-start space-x-2.5 text-xs text-red-800 font-medium">
                <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* STEP 1: ISSUE DETAILS */}
              {currentStep === 1 && (
                <div className="space-y-4 font-sans animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-[#e5e2da] pb-3 font-headline">
                    <span className="text-xs font-extrabold text-[#06291b] uppercase tracking-wider">
                      Step 01 — What happened?
                    </span>
                    <span className="text-xs text-[#787770]">Basic Details</span>
                  </div>

                  <Input
                    label="Report Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Hazardous Pothole on Oak Street"
                    minLength={5}
                    maxLength={255}
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Select
                      label="Category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ReportCategory)}
                    >
                      <option value="POTHOLE">Potholes & Roads</option>
                      <option value="GARBAGE">Garbage & Sanitation</option>
                      <option value="STREETLIGHT">Streetlights & Power</option>
                      <option value="WATER_LEAK">Water & Sewage</option>
                      <option value="DAMAGED_INFRASTRUCTURE">Damaged Infrastructure</option>
                      <option value="OTHER">Other Community Issue</option>
                    </Select>

                    <Select
                      label="Severity Level"
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value as ReportSeverity)}
                    >
                      <option value="LOW">Low (Minor concern)</option>
                      <option value="MEDIUM">Medium (Moderate issue)</option>
                      <option value="HIGH">High (Urgent concern)</option>
                      <option value="CRITICAL">Critical (Immediate hazard)</option>
                    </Select>
                  </div>

                  <Textarea
                    label="Description"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you noticed and how long it has been present..."
                    minLength={10}
                    maxLength={2000}
                    required
                  />

                  <div className="pt-2 flex justify-end">
                    <Button
                      type="button"
                      size="md"
                      disabled={!title.trim() || !description.trim()}
                      onClick={() => setCurrentStep(2)}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Next: Location
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 2: LOCATION */}
              {currentStep === 2 && (
                <div className="space-y-4 font-sans animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-[#e5e2da] pb-3 font-headline">
                    <span className="text-xs font-extrabold text-[#06291b] uppercase tracking-wider">
                      Step 02 — Where is it located?
                    </span>
                    <span className="text-xs text-[#787770]">Map Location</span>
                  </div>

                  <Input
                    label="Street Address or Landmark (Optional)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Near Oak Street and 4th Avenue Incline"
                  />

                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="font-semibold text-[#484742] flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5 text-[#2f685f]" />
                      <span>Adjust Pinpoint on Map</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="inline-flex items-center space-x-1 text-xs font-bold text-[#06291b] hover:underline"
                    >
                      <Crosshair className="h-3.5 w-3.5 text-[#2f685f]" />
                      <span>Use My Location</span>
                    </button>
                  </div>

                  <div className="pt-2 flex justify-between">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => setCurrentStep(1)}
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      size="md"
                      onClick={() => setCurrentStep(3)}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Next: Photo Evidence
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 3: EVIDENCE */}
              {currentStep === 3 && (
                <div className="space-y-4 font-sans animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-[#e5e2da] pb-3 font-headline">
                    <span className="text-xs font-extrabold text-[#06291b] uppercase tracking-wider">
                      Step 03 — Photo Evidence
                    </span>
                    <span className="text-xs text-[#787770]">Optional Attachment</span>
                  </div>

                  <ImageUploader
                    files={selectedFile ? [selectedFile] : []}
                    onFilesSelect={handleFileChange}
                    onFileRemove={() => handleRemoveImage()}
                    isUploading={uploadMediaMutation.isPending}
                    uploadProgress={uploadProgress}
                    error={imageError}
                  />

                  <div className="pt-2 flex justify-between">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => setCurrentStep(2)}
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      size="md"
                      onClick={() => setCurrentStep(4)}
                      rightIcon={<ArrowRight className="h-4 w-4" />}
                    >
                      Next: Review & Submit
                    </Button>
                  </div>
                </div>
              )}

              {/* STEP 4: REVIEW & SUBMIT */}
              {currentStep === 4 && (
                <div className="space-y-4 font-sans animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-[#e5e2da] pb-3 font-headline">
                    <span className="text-xs font-extrabold text-[#06291b] uppercase tracking-wider">
                      Step 04 — Review Report Summary
                    </span>
                    <span className="text-xs text-[#787770]">Final Check</span>
                  </div>

                  <div className="rounded-2xl border border-[#e5e2da] bg-[#fcf9f2] p-5 space-y-4 text-xs text-[#1c1c18]">
                    <div>
                      <span className="text-[10px] font-bold text-[#787770] uppercase font-headline">Title</span>
                      <h4 className="text-base font-extrabold text-[#1c1c18] font-headline">{title || 'Untitled Report'}</h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-[#787770] uppercase font-headline">Category</span>
                        <div className="font-semibold text-[#06291b]">{category.replace('_', ' ')}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-[#787770] uppercase font-headline">Severity</span>
                        <div className="font-semibold text-amber-900">{severity} Severity</div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#787770] uppercase font-headline">Description</span>
                      <p className="text-[#484742] leading-relaxed">{description}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-[#787770] uppercase font-headline">Location</span>
                      <div className="font-mono text-[#484742]">
                        {address || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`}
                      </div>
                    </div>

                    {selectedFile && (
                      <div>
                        <span className="text-[10px] font-bold text-[#787770] uppercase font-headline">Attached Photo</span>
                        <div className="font-mono text-[#2f685f]">{selectedFile.name}</div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={() => setCurrentStep(3)}
                      leftIcon={<ArrowLeft className="h-4 w-4" />}
                    >
                      Back
                    </Button>

                    <Button
                      type="submit"
                      size="lg"
                      className="flex-1"
                      isLoading={isSubmitting}
                      leftIcon={<Check className="h-4 w-4" />}
                    >
                      Submit Report Now
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Card>
        </div>

        {/* Right Column: Interactive Location Map Preview Panel */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="container" className="shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#e5e2da]">
              <h3 className="text-xs font-bold text-[#1c1c18] uppercase tracking-wider font-headline flex items-center space-x-1.5">
                <MapPin className="h-4 w-4 text-[#2f685f]" />
                <span>Location Reference</span>
              </h3>
              <span className="text-[10px] font-mono text-[#787770]">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </span>
            </div>

            <div className="h-[320px] w-full rounded-2xl overflow-hidden border border-[#d0cdc5] relative">
              <MapContainer
                center={[latitude, longitude]}
                zoom={14}
                scrollWheelZoom={false}
                className="h-full w-full z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationPickerMarker
                  position={[latitude, longitude]}
                  onPositionChange={(lat, lng) => {
                    setLatitude(lat);
                    setLongitude(lng);
                  }}
                />
              </MapContainer>
            </div>

            <div className="p-3.5 rounded-xl bg-[#fcf9f2] border border-[#e5e2da] text-xs text-[#484742] leading-relaxed">
              <span className="font-bold text-[#06291b] block mb-0.5 font-headline">Map Instructions</span>
              Click anywhere on the map or drag the location pin to pinpoint the exact issue spot.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
