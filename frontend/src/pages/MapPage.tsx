import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapReports } from '../hooks/useMapReports';
import { useHotspots } from '../hooks/useIntelligence';
import { MapQueryParams } from '../types/map';
import { ReportCategory, ReportSeverity, ReportStatus } from '../types/report';
import {
  MapPin,
  Filter,
  Crosshair,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';

// Custom Marker DivIcons with severity styling
const createSeverityIcon = (severity: ReportSeverity) => {
  let colorClass = 'bg-[#2f685f] border-white text-white';
  let pulse = false;

  if (severity === 'CRITICAL' || severity === 'HIGH') {
    colorClass = 'bg-red-700 border-red-200 text-white';
    pulse = true;
  } else if (severity === 'MEDIUM') {
    colorClass = 'bg-amber-600 border-amber-200 text-white';
  }

  const html = `
    <div class="relative flex items-center justify-center">
      ${pulse ? '<span class="absolute inline-flex h-8 w-8 rounded-full bg-red-600 opacity-40 animate-ping"></span>' : ''}
      <div class="relative inline-flex h-6 w-6 items-center justify-center rounded-full border-2 ${colorClass} shadow-md font-bold text-[10px]">
        !
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
};

// Component listening to map move/zoom events to update viewport bounding box
const MapViewportHandler: React.FC<{
  onBoundsChange: (bounds: {
    min_latitude: number;
    max_latitude: number;
    min_longitude: number;
    max_longitude: number;
  }) => void;
}> = ({ onBoundsChange }) => {
  const map = useMap();

  const updateBounds = useCallback(() => {
    const b = map.getBounds();
    onBoundsChange({
      min_latitude: Number(b.getSouth().toFixed(6)),
      max_latitude: Number(b.getNorth().toFixed(6)),
      min_longitude: Number(b.getWest().toFixed(6)),
      max_longitude: Number(b.getEast().toFixed(6)),
    });
  }, [map, onBoundsChange]);

  useMapEvents({
    moveend: updateBounds,
    zoomend: updateBounds,
  });

  useEffect(() => {
    updateBounds();
  }, [updateBounds]);

  return null;
};

// Component to handle pan to center
const MapRecenterController: React.FC<{ center: [number, number] | null }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

export const MapPage: React.FC = () => {
  const defaultCenter: [number, number] = [12.9716, 77.5946]; // Default Bengaluru
  const [recenterPos, setRecenterPos] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Filter States
  const [category, setCategory] = useState<string>('');
  const [severity, setSeverity] = useState<string>('');
  const [reportStatus, setReportStatus] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [showHotspots, setShowHotspots] = useState<boolean>(true);

  // Initial params
  const initialParams: MapQueryParams = {
    min_latitude: 12.9000,
    max_latitude: 13.0500,
    min_longitude: 77.5000,
    max_longitude: 77.7000,
    limit: 500,
  };

  const { data, setParams, isFetching, isError } = useMapReports(initialParams);
  const { data: hotspotsData } = useHotspots({ status: 'ACTIVE' });

  // Handle bounds update from map move/zoom
  const handleBoundsChange = useCallback(
    (bounds: {
      min_latitude: number;
      max_latitude: number;
      min_longitude: number;
      max_longitude: number;
    }) => {
      let date_from: string | undefined = undefined;
      if (dateFilter === '7d') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        date_from = d.toISOString();
      } else if (dateFilter === '30d') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        date_from = d.toISOString();
      }

      setParams({
        ...bounds,
        category: category ? (category as ReportCategory) : undefined,
        severity: severity ? (severity as ReportSeverity) : undefined,
        status: reportStatus ? (reportStatus as ReportStatus) : undefined,
        date_from,
        limit: 500,
      });
    },
    [category, severity, reportStatus, dateFilter, setParams]
  );

  // Geolocation button handler
  const handleCurrentLocation = () => {
    setLocationError(null);
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setRecenterPos([lat, lng]);
      },
      () => {
        setLocationError('Location access unavailable. You can navigate the map manually.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-6 font-sans text-[#1c1c18]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1c1c18] tracking-tight flex items-center space-x-2 font-headline">
            <MapPin className="h-6 w-6 text-[#2f685f]" />
            <span>See what's happening around you</span>
          </h1>
          <p className="text-xs text-[#787770] font-sans">
            Explore nearby issues and see where problems may be connected.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center space-x-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors ${
              showHotspots
                ? 'border-amber-300 bg-amber-50 text-amber-900'
                : 'border-[#d0cdc5] bg-[#f1eee7] text-[#484742] hover:bg-[#e5e2da]'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>Possible Hotspots ({hotspotsData?.count ?? 0})</span>
          </button>

          <button
            onClick={handleCurrentLocation}
            className="flex items-center space-x-1.5 rounded-xl border border-[#d0cdc5] bg-[#f1eee7] hover:bg-[#e5e2da] px-3.5 py-2 text-xs font-semibold text-[#1c1c18] transition-colors"
            title="Locate Me"
          >
            <Crosshair className="h-4 w-4 text-[#2f685f]" />
            <span>Near Me</span>
          </button>
        </div>
      </div>

      {locationError && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 flex items-center space-x-2">
          <Info className="h-4 w-4 text-amber-600 flex-shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Filter Control Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl border border-[#e5e2da] bg-[#f1eee7] text-xs">
        <div className="flex items-center space-x-1.5 text-[#484742] pr-2 border-r border-[#d0cdc5] font-semibold">
          <Filter className="h-3.5 w-3.5 text-[#2f685f]" />
          <span>Category:</span>
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] px-3 py-1.5 text-xs text-[#1c1c18] focus:outline-none focus:ring-1 focus:ring-[#06291b]"
        >
          <option value="">All Issues</option>
          <option value="POTHOLE">Potholes & Roads</option>
          <option value="WATER_LEAK">Water & Drainage</option>
          <option value="STREETLIGHT">Lighting</option>
          <option value="GARBAGE">Garbage & Sanitation</option>
          <option value="DAMAGED_INFRASTRUCTURE">Damaged Infrastructure</option>
          <option value="OTHER">Other Issues</option>
        </select>

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] px-3 py-1.5 text-xs text-[#1c1c18] focus:outline-none focus:ring-1 focus:ring-[#06291b]"
        >
          <option value="">All Severities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="CRITICAL">Critical</option>
        </select>

        <select
          value={reportStatus}
          onChange={(e) => setReportStatus(e.target.value)}
          className="rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] px-3 py-1.5 text-xs text-[#1c1c18] focus:outline-none focus:ring-1 focus:ring-[#06291b]"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="VERIFIED">Verified</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-xl border border-[#d0cdc5] bg-[#fcf9f2] px-3 py-1.5 text-xs text-[#1c1c18] focus:outline-none focus:ring-1 focus:ring-[#06291b]"
        >
          <option value="all">Any Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>

        <div className="ml-auto text-[#787770] text-xs flex items-center space-x-2 font-mono">
          {isFetching && (
            <div className="flex items-center space-x-1 text-[#06291b] animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Updating area...</span>
            </div>
          )}
          <span>Visible Reports: {data?.count ?? 0}</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e5e2da] bg-[#fcf9f2] h-[580px] shadow-sm">
        <MapContainer
          center={defaultCenter}
          zoom={12}
          scrollWheelZoom={true}
          className="h-full w-full z-10"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapViewportHandler onBoundsChange={handleBoundsChange} />
          <MapRecenterController center={recenterPos} />

          {/* Render Hotspot Circles */}
          {showHotspots && hotspotsData && hotspotsData.hotspots.map((hotspot) => (
            <Circle
              key={hotspot.id}
              center={[hotspot.center_latitude, hotspot.center_longitude]}
              radius={hotspot.radius}
              pathOptions={{
                color: '#d97706',
                fillColor: '#f59e0b',
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '6, 6',
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 space-y-2 max-w-xs text-[#1c1c18]">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center space-x-1">
                      <Sparkles className="h-3 w-3 inline mr-1 text-amber-700" />
                      <span>Possible Hotspot</span>
                    </span>
                    <span className="text-[11px] font-bold text-amber-800 font-mono">
                      {((hotspot.confidence || 0) * 100).toFixed(0)}% confidence
                    </span>
                  </div>

                  <h4 className="font-bold text-sm leading-tight text-[#1c1c18]">{hotspot.title}</h4>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-[#f1eee7] p-2 rounded-lg border border-[#e5e2da]">
                    <div>
                      <span className="text-[#787770] block text-[10px]">Reports:</span>
                      <span className="font-bold text-[#1c1c18]">{hotspot.report_count} reports</span>
                    </div>
                    <div>
                      <span className="text-[#787770] block text-[10px]">Radius:</span>
                      <span className="font-bold text-[#1c1c18]">{Math.round(hotspot.radius)}m</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#484742] leading-relaxed font-medium bg-amber-50/80 p-2 rounded-lg border border-amber-200">
                    Multiple reports in this area may indicate a recurring issue.
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {hotspot.categories.map((c, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[9px] bg-[#e5e2da] text-[#1c1c18] font-medium">
                        {c.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              </Popup>
            </Circle>
          ))}

          {/* Render Markers */}
          {data && data.reports.map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
              icon={createSeverityIcon(report.severity)}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-2 space-y-2 max-w-xs text-[#1c1c18]">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#1c1c18] text-white uppercase">
                      {report.category.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                      report.severity === 'CRITICAL' || report.severity === 'HIGH' ? 'bg-red-700' : 'bg-amber-600'
                    }`}>
                      {report.severity}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm leading-tight text-[#1c1c18]">{report.title}</h4>
                  <p className="text-xs text-[#484742] line-clamp-2">{report.description}</p>

                  {report.thumbnail_url && (
                    <img
                      src={report.thumbnail_url}
                      alt="Report evidence"
                      className="h-24 w-full object-cover rounded-lg border border-[#e5e2da]"
                    />
                  )}

                  <div className="flex items-center justify-between text-[11px] text-[#787770] pt-1 border-t border-[#e5e2da]">
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    <Link
                      to={`/reports/${report.id}`}
                      className="inline-flex items-center space-x-1 font-bold text-[#06291b] hover:underline"
                    >
                      <span>View Details</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Empty State Overlay */}
        {data && data.reports.length === 0 && !isFetching && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-xl border border-[#e5e2da] bg-[#fcf9f2]/95 backdrop-blur-md px-4 py-2 text-xs text-[#484742] shadow-lg flex items-center space-x-2 font-medium">
            <Info className="h-4 w-4 text-[#2f685f]" />
            <span>No reports found in this map area. Zoom out or move the map to explore.</span>
          </div>
        )}

        {/* Truncated Results Warning */}
        {data && data.truncated && (
          <div className="absolute top-4 right-4 z-20 rounded-xl border border-amber-300 bg-amber-50/95 backdrop-blur-md px-3.5 py-2 text-xs text-amber-900 shadow-md flex items-center space-x-2 font-medium">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>Showing top {data.limit} reports. Zoom in to see more detail.</span>
          </div>
        )}

        {/* API Error Overlay */}
        {isError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 rounded-xl border border-red-300 bg-red-50/95 backdrop-blur-md px-4 py-2 text-xs text-red-800 shadow-md">
            Unable to load map reports. Please try again.
          </div>
        )}
      </div>
    </div>
  );
};

