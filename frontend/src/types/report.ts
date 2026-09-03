export type ReportCategory =
  | 'POTHOLE'
  | 'GARBAGE'
  | 'STREETLIGHT'
  | 'WATER_LEAK'
  | 'DAMAGED_INFRASTRUCTURE'
  | 'OTHER';

export type ReportSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ReportStatus = 'OPEN' | 'VERIFIED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

export type VerificationStatus = 'UNVERIFIED' | 'UNDER_REVIEW' | 'ADMIN_VERIFIED' | 'REJECTED';

export interface ReportMedia {
  id: string;
  report_id: string;
  media_url: string;
  media_type: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  user_name?: string;
  title: string;
  description: string;
  category: ReportCategory;
  severity: ReportSeverity;
  status: ReportStatus;
  latitude: number;
  longitude: number;
  address?: string;
  ai_confidence?: number;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
  media: ReportMedia[];
}

export interface ReportCreateData {
  title: string;
  description: string;
  category: ReportCategory;
  severity: ReportSeverity;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ReportFilters {
  page?: number;
  limit?: number;
  category?: ReportCategory;
  severity?: ReportSeverity;
  status?: ReportStatus;
  my_reports_only?: boolean;
}

export interface ReportListResponse {
  items: Report[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
