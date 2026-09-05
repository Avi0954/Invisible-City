import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMapReports } from '../hooks/useMapReports';
import { useHotspots } from '../hooks/useIntelligence';
import { MapReportItem, MapQueryParams } from '../types/map';
import { ReportCategory, ReportSeverity, ReportStatus } from '../types/report';
import {
  MapPin,
  Filter,
  Layers,
  Crosshair,
  AlertTriangle,
  ExternalLink,
  Clock,
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';

// Custom Marker DivIcons with severity styling
const createSeverityIcon = (severity: ReportSeverity) => {
  let colorClass = 'bg-cyan-500 border-cyan-300 text-cyan-950';
  let pulse = false;

  if (severity === 'CRITICAL' || severity === 'HIGH') {
    colorClass = 'bg-red-500 border-red-200 text-white';
    pulse = true;
  } else if (severity === 'MEDIUM') {
    colorClass = 'bg-amber-500 border-amber-200 text-amber-950';
  }

  const html = `
    <div class="relative flex items-center justify-center">
      ${pulse ? '<span class="absolute inline-flex h-8 w-8 rounded-full bg-red-500 opacity-60 animate-ping"></span>' : ''}
      <div class="relative inline-flex h-6 w-6 items-center justify-center rounded-full border-2 ${colorClass} shadow-lg font-bold text-[10px]">
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

  const { data, isLoading, isError, setParams, isFetching } = useMapReports(initialParams);
  const { data: hotspotsData } = useHotspots({ status: 'ACTIVE' });

  // Handle bounds update from map move/zoom
  const handleBoundsChange = useCallback(
    (bounds: {
      min_latitude: number;
      max_latitude: number;
      min_longitude: number;
      max_longitude: number;
    }) => {
      // Calculate date_from if date filter is set
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
      (err) => {
        setLocationError('Location access denied or unavailable. You can still explore manually.');
      },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center space-x-2">
            <MapPin className="h-6 w-6 text-cyan-400" />
            <span>Spatial Problem Map</span>
          </h1>
          <p className="text-xs text-slate-400">
            Interactive PostGIS spatial GIS view displaying reports dynamically by visible viewport bounds.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowHotspots(!showHotspots)}
            className={`flex items-center space-x-1.5 rounded-xl border px-3.5 py-2 text-xs font-medium transition-colors ${
              showHotspots
                ? 'border-amber-800 bg-amber-950/80 text-amber-300'
                : 'border-slate-700 bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Hotspot Layer ({hotspotsData?.count ?? 0})</span>
          </button>

          <button
            onClick={handleCurrentLocation}
            className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 text-xs font-medium text-slate-200 transition-colors"
            title="Locate Me"
          >
            <Crosshair className="h-4 w-4 text-cyan-400" />
            <span>Current Location</span>
          </button>
        </div>
      </div>

      {locationError && (
        <div className="rounded-xl border border-amber-800 bg-amber-950/60 p-3 text-xs text-amber-300 flex items-center space-x-2">
          <Info className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <span>{locationError}</span>
        </div>
      )}

      {/* Filter Control Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-slate-900/80 text-xs">
        <div className="flex items-center space-x-1.5 text-slate-400 pr-2 border-r border-slate-800 font-semibold">
          <Filter className="h-3.5 w-3.5 text-cyan-400" />
          <span>Filters:</span>
        </div>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="">All Categories</option>
          <option value="POTHOLE">Potholes & Roads</option>
          <option value="GARBAGE">Garbage & Waste</option>
          <option value="STREETLIGHT">Streetlights</option>
          <option value="WATER_LEAK">Water Leaks</option>
          <option value="DAMAGED_INFRASTRUCTURE">Damaged Infrastructure</option>
          <option value="OTHER">Other</option>
        </select>

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
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
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-200 focus:outline-none"
        >
          <option value="all">Any Time</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>

        <div className="ml-auto text-slate-400 font-mono text-[11px] flex items-center space-x-2">
          {isFetching && (
            <div className="flex items-center space-x-1 text-cyan-400 animate-pulse">
              <RefreshCw className="h-3 w-3 animate-spin" />
              <span>Fetching Viewport...</span>
            </div>
          )}
          <span>Visible Reports: {data?.count ?? 0}</span>
        </div>
      </div>

      {/* Map Container Container */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 h-[600px] shadow-2xl">
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
                color: '#f59e0b',
                fillColor: '#f59e0b',
                fillOpacity: 0.22,
                weight: 2,
                dashArray: '6, 6',
              }}
            >
              <Popup className="custom-leaflet-popup">
                <div className="p-3 space-y-2 max-w-xs text-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-600 text-white flex items-center space-x-1">
                      <Sparkles className="h-3 w-3 inline mr-1" />
                      <span>Possible Hotspot</span>
                    </span>
                    <span className="text-[11px] font-bold text-amber-700 font-mono">
                      {((hotspot.confidence || 0) * 100).toFixed(0)}% confidence
                    </span>
                  </div>

                  <h4 className="font-bold text-sm leading-tight text-slate-950">{hotspot.title}</h4>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] bg-slate-100 p-2 rounded border border-slate-200">
                    <div>
                      <span className="text-slate-500 block text-[10px]">Reports:</span>
                      <span className="font-bold">{hotspot.report_count} complaints</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">Radius:</span>
                      <span className="font-bold">{Math.round(hotspot.radius)}m</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-medium bg-amber-50 p-2 rounded border border-amber-200">
                    {hotspot.explanation}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {hotspot.categories.map((c, idx) => (
                      <span key={idx} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-200 text-slate-800 font-medium">
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
                <div className="p-2 space-y-2 max-w-xs text-slate-900">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase">
                      {report.category.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                      report.severity === 'CRITICAL' || report.severity === 'HIGH' ? 'bg-red-600' : 'bg-amber-600'
                    }`}>
                      {report.severity}
                    </span>
                  </div>

                  <h4 className="font-bold text-sm leading-tight text-slate-950">{report.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-2">{report.description}</p>

                  {report.thumbnail_url && (
                    <img
                      src={report.thumbnail_url}
                      alt="Report evidence"
                      className="h-24 w-full object-cover rounded border border-slate-200"
                    />
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    <Link
                      to={`/reports/${report.id}`}
                      className="inline-flex items-center space-x-1 font-bold text-cyan-600 hover:text-cyan-700"
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
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 rounded-xl border border-slate-800 bg-slate-950/90 backdrop-blur-md px-4 py-2 text-xs text-slate-400 shadow-xl flex items-center space-x-2">
            <Info className="h-4 w-4 text-cyan-400" />
            <span>No civic reports found in this visible map viewport.</span>
          </div>
        )}

        {/* Truncated Results Warning */}
        {data && data.truncated && (
          <div className="absolute top-4 right-4 z-20 rounded-xl border border-amber-800 bg-amber-950/90 backdrop-blur-md px-3.5 py-2 text-xs text-amber-300 shadow-xl flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-400" />
            <span>Results truncated to {data.limit} reports. Zoom in to see all issues.</span>
          </div>
        )}

        {/* API Error Overlay */}
        {isError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 rounded-xl border border-red-800 bg-red-950/90 backdrop-blur-md px-4 py-2 text-xs text-red-300 shadow-xl">
            Unable to load spatial reports. Please refresh or try again.
          </div>
        )}
      </div>
    </div>
  );
};
