import { ReportCategory, ReportSeverity, ReportStatus } from './report';

export interface MapReportItem {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: ReportSeverity;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  address?: string;
  created_at: string;
  thumbnail_url?: string;
}

export interface MapReportListResponse {
  reports: MapReportItem[];
  count: number;
  limit: number;
  truncated: boolean;
}

export interface MapQueryParams {
  latitude?: number;
  longitude?: number;
  radius?: number;
  min_latitude?: number;
  max_latitude?: number;
  min_longitude?: number;
  max_longitude?: number;
  category?: ReportCategory;
  severity?: ReportSeverity;
  status?: ReportStatus;
  date_from?: string;
  date_to?: string;
  limit?: number;
}
