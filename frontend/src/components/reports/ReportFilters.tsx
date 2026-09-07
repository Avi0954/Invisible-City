import React from 'react';
import { Filter } from 'lucide-react';
import { Select } from '../ui/Input';

export interface ReportFiltersProps {
  category: string;
  severity: string;
  status: string;
  onCategoryChange: (value: string) => void;
  onSeverityChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  className?: string;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({
  category,
  severity,
  status,
  onCategoryChange,
  onSeverityChange,
  onStatusChange,
  className = '',
}) => {
  return (
    <div className={`flex flex-wrap items-center gap-3 p-4 rounded-2xl border border-[#e5e2da] bg-[#f1eee7] text-xs ${className}`}>
      <div className="flex items-center space-x-1.5 text-[#484742] pr-2 border-r border-[#d0cdc5]">
        <Filter className="h-3.5 w-3.5 text-[#2f685f]" />
        <span className="font-semibold">Filter:</span>
      </div>

      <Select
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="w-auto py-1 px-3 text-xs"
      >
        <option value="">All Categories</option>
        <option value="POTHOLE">Potholes & Roads</option>
        <option value="GARBAGE">Garbage & Waste</option>
        <option value="STREETLIGHT">Streetlights & Power</option>
        <option value="WATER_LEAK">Water & Sewage</option>
        <option value="DAMAGED_INFRASTRUCTURE">Damaged Infrastructure</option>
        <option value="OTHER">Other Issues</option>
      </Select>

      <Select
        value={severity}
        onChange={(e) => onSeverityChange(e.target.value)}
        className="w-auto py-1 px-3 text-xs"
      >
        <option value="">All Severities</option>
        <option value="LOW">Low Severity</option>
        <option value="MEDIUM">Medium Severity</option>
        <option value="HIGH">High Severity</option>
        <option value="CRITICAL">Critical Severity</option>
      </Select>

      <Select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-auto py-1 px-3 text-xs"
      >
        <option value="">All Statuses</option>
        <option value="OPEN">Open</option>
        <option value="VERIFIED">Verified</option>
        <option value="IN_PROGRESS">In Progress</option>
        <option value="RESOLVED">Resolved</option>
      </Select>
    </div>
  );
};
