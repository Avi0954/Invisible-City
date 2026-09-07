import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Link } from 'react-router-dom';
import { Report } from '../../types/report';
import { StatusBadge } from '../ui/StatusBadge';
import { MapPin, ExternalLink } from 'lucide-react';

const createSeverityIcon = (severity: string) => {
  const colors: Record<string, string> = {
    LOW: '#0284c7',
    MEDIUM: '#d97706',
    HIGH: '#ea580c',
    CRITICAL: '#dc2626',
  };

  const color = colors[severity] || '#0284c7';

  const svgHtml = `
    <div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 2.5px solid white;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 11px;
      font-family: sans-serif;
    ">
      !
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-severity-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

export interface ReportMarkerProps {
  report: Report;
}

export const ReportMarker: React.FC<ReportMarkerProps> = ({ report }) => {
  return (
    <Marker
      position={[report.latitude, report.longitude]}
      icon={createSeverityIcon(report.severity)}
    >
      <Popup className="custom-leaflet-popup">
        <div className="p-1 space-y-2 max-w-xs font-sans text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={report.status} size="sm" />
            <StatusBadge severity={report.severity} size="sm" />
          </div>

          <h4 className="font-bold text-[#1c1c18] font-headline text-sm">{report.title}</h4>
          <p className="text-[#484742] line-clamp-2 leading-tight">{report.description}</p>

          <div className="pt-1 flex items-center justify-between border-t border-[#e5e2da]">
            <span className="text-[10px] text-[#787770]">
              {report.address || `${report.latitude.toFixed(3)}, ${report.longitude.toFixed(3)}`}
            </span>
            <Link
              to={`/reports/${report.id}`}
              className="inline-flex items-center space-x-1 font-bold text-[#06291b] hover:underline"
            >
              <span>Details</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
