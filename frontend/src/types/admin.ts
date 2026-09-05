export interface AdminOverviewResponse {
  total_reports: number;
  open_reports: number;
  verified_reports: number;
  resolved_reports: number;
  hotspot_count: number;
  high_priority_count: number;
}

export interface AdminReportItem {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  verification_status: string;
  latitude: number;
  longitude: number;
  address?: string;
  priority_score: number;
  priority_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority_reasons: string[];
  created_at: string;
  user_name?: string;
}

export interface AdminReportListResponse {
  items: AdminReportItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminReportQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  verification_status?: string;
  category?: string;
  severity?: string;
}

export interface AuditLogItem {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  created_at: string;
}

export interface FlagItem {
  id: string;
  report_id: string;
  reporter_id: string;
  reason: string;
  details?: string;
  created_at: string;
}
