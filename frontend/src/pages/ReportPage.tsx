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
import {
  PlusCircle,
  MapPin,
  Camera,
  AlertTriangle,
  X,
  Crosshair
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
    <div className="mx-auto max-w-2xl px-4 py-8 space-y-6 font-sans text-[#1c1c18]">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c18] tracking-tight flex items-center space-x-2.5 font-headline">
          <PlusCircle className="h-7 w-7 text-[#2f685f]" />
          <span>Report an Issue</span>
        </h1>
        <p className="text-xs text-[#787770]">
          Tell us what you noticed in your neighborhood so local teams can take action.
        </p>
      </div>

      <Card variant="container" className="shadow-sm p-6 sm:p-8 space-y-6">
        {formError && (
          <div className="rounded-xl border border-red-300 bg-red-50 p-3.5 flex items-start space-x-2.5 text-xs text-red-800 font-medium">
            <AlertTriangle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: WHAT HAPPENED? */}
          <div className="space-y-4 rounded-xl border border-[#e5e2da] bg-[#fcf9f2] p-5">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#06291b] uppercase tracking-wider border-b border-[#e5e2da] pb-2 font-headline">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#06291b] text-white text-[11px] font-mono">1</span>
              <span>What happened?</span>
            </div>

            {/* Title */}
            <Input
              label="Report Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hazardous Pothole on Oak Street"
              minLength={5}
              maxLength={255}
              required
            />

            {/* Category & Severity Grid */}
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

            {/* Description */}
            <Textarea
              label="Description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what you noticed and how long it has been present..."
              minLength={10}
              maxLength={2000}
              required
            />
          </div>

          {/* STEP 2: WHERE IS IT LOCATED? */}
          <div className="space-y-4 rounded-xl border border-[#e5e2da] bg-[#fcf9f2] p-5">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#06291b] uppercase tracking-wider border-b border-[#e5e2da] pb-2 font-headline">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#06291b] text-white text-[11px] font-mono">2</span>
              <span>Where is it located?</span>
            </div>

            <Input
              label="Street Address or Landmark (Optional)"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Oak Street and 4th Avenue Incline"
            />

            {/* Interactive Map Location Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-[#484742] flex items-center space-x-1">
                  <MapPin className="h-3.5 w-3.5 text-[#2f685f]" />
                  <span>Pinpoint Location on Map</span>
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

              {/* Map Container */}
              <div className="relative h-60 w-full rounded-xl overflow-hidden border border-[#d0cdc5] shadow-xs">
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
                <div className="absolute bottom-2 right-2 z-10 bg-[#fcf9f2]/95 border border-[#e5e2da] px-2.5 py-1 rounded-lg text-[10px] font-mono text-[#484742] shadow-xs">
                  Click map or drag pin to adjust location
                </div>
              </div>

              {/* Fine tuning coordinates */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={latitude}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-[#d0cdc5] bg-[#f1eee7] px-3.5 py-2 text-xs text-[#1c1c18] font-mono"
                    required
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-[#787770] font-mono">LAT</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={longitude}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-xl border border-[#d0cdc5] bg-[#f1eee7] px-3.5 py-2 text-xs text-[#1c1c18] font-mono"
                    required
                  />
                  <span className="absolute right-3 top-2 text-[10px] text-[#787770] font-mono">LNG</span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: EVIDENCE & SUBMIT */}
          <div className="space-y-4 rounded-xl border border-[#e5e2da] bg-[#fcf9f2] p-5">
            <div className="flex items-center space-x-2 text-xs font-bold text-[#06291b] uppercase tracking-wider border-b border-[#e5e2da] pb-2 font-headline">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#06291b] text-white text-[11px] font-mono">3</span>
              <span>Photo Evidence & Submission</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#484742] mb-1.5">
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
                  <div className="text-xs text-[#1c1c18] font-bold">Click to select photo evidence</div>
                  <p className="text-[11px] text-[#787770]">Supports JPG, PNG, or WEBP up to 10MB</p>
                </label>
              )}

              {/* Upload Progress Bar */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-[#06291b] font-semibold">
                    <span>Uploading photo evidence...</span>
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

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isSubmitting}
              leftIcon={<PlusCircle className="h-4 w-4" />}
            >
              Submit Report
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
