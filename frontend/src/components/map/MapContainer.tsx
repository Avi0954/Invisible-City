import React, { useEffect } from 'react';
import { MapContainer as LeafletMap, TileLayer, Circle, useMap } from 'react-leaflet';
import { Report } from '../../types/report';
import { HotspotItem } from '../../types/intelligence';
import { ReportMarker } from './ReportMarker';
import 'leaflet/dist/leaflet.css';

interface ViewportListenerProps {
  onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
}

const ViewportListener: React.FC<ViewportListenerProps> = ({ onBoundsChange }) => {
  const map = useMap();

  useEffect(() => {
    if (!onBoundsChange) return;

    const handleMoveEnd = () => {
      const b = map.getBounds();
      onBoundsChange({
        minLat: b.getSouth(),
        maxLat: b.getNorth(),
        minLng: b.getWest(),
        maxLng: b.getEast(),
      });
    };

    map.on('moveend', handleMoveEnd);
    handleMoveEnd(); // Initial calculation

    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onBoundsChange]);

  return null;
};

export interface MapContainerProps {
  center?: [number, number];
  zoom?: number;
  reports?: Report[];
  hotspots?: HotspotItem[];
  onBoundsChange?: (bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number }) => void;
  className?: string;
  children?: React.ReactNode;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  center = [12.9716, 77.5946],
  zoom = 12,
  reports = [],
  hotspots = [],
  onBoundsChange,
  className = 'h-full w-full',
  children,
}) => {
  return (
    <div className={`relative ${className}`}>
      <LeafletMap
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full z-0 font-sans"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ViewportListener onBoundsChange={onBoundsChange} />

        {/* Hotspot Circles */}
        {hotspots.map((hotspot) => (
          <Circle
            key={hotspot.id}
            center={[hotspot.center_latitude, hotspot.center_longitude]}
            radius={hotspot.radius || 500}
            pathOptions={{
              color: '#dc2626',
              fillColor: '#ef4444',
              fillOpacity: 0.25,
              weight: 1.5,
            }}
          />
        ))}

        {/* Report Markers */}
        {reports.map((report) => (
          <ReportMarker key={report.id} report={report} />
        ))}

        {children}
      </LeafletMap>
    </div>
  );
};
