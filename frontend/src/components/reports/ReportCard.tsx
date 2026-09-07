import React from 'react';
import { Link } from 'react-router-dom';
import { Report } from '../../types/report';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { MapPin, ExternalLink, Calendar } from 'lucide-react';

export interface ReportCardProps {
  report: Report;
  showActions?: boolean;
  className?: string;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  showActions = true,
  className = '',
}) => {
  return (
    <Card
      variant="container"
      className={`hover:border-[#d0cdc5] transition-all flex flex-col sm:flex-row justify-between gap-4 shadow-xs ${className}`}
    >
      <div className="space-y-2.5 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={report.status} />
          <span className="text-[10px] font-bold text-[#484742] uppercase tracking-wider bg-[#fcf9f2] px-2 py-0.5 rounded border border-[#e5e2da] font-headline">
            {report.category.replace('_', ' ')}
          </span>
          <StatusBadge severity={report.severity} size="sm" />
        </div>

        <h3 className="text-lg font-bold text-[#1c1c18] font-headline">
          <Link to={`/reports/${report.id}`} className="hover:text-[#06291b] hover:underline transition-colors">
            {report.title}
          </Link>
        </h3>

        <p className="text-xs text-[#484742] line-clamp-2 leading-relaxed">{report.description}</p>

        <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#787770] pt-1">
          <div className="flex items-center space-x-1">
            <MapPin className="h-3.5 w-3.5 text-[#2f685f]" />
            <span>{report.address || `${report.latitude.toFixed(4)}, ${report.longitude.toFixed(4)}`}</span>
          </div>

          <div className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5 text-[#787770]" />
            <span>Submitted {new Date(report.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="flex sm:flex-col justify-between items-end gap-2 flex-shrink-0">
        {report.media && report.media.length > 0 && (
          <img
            src={report.media[0].media_url}
            alt="Report attachment preview"
            className="h-16 w-20 object-cover rounded-lg border border-[#e5e2da]"
          />
        )}

        {showActions && (
          <Link
            to={`/reports/${report.id}`}
            className="inline-flex items-center space-x-1 text-xs font-bold text-[#06291b] hover:underline transition-colors mt-auto"
          >
            <span>View Details</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </Card>
  );
};
