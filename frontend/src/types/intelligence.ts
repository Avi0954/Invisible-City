export interface RelationshipItem {
  id: string;
  report_id: string;
  related_report_id: string;
  relation_type: 'DUPLICATE' | 'RELATED' | 'UNRELATED';
  score: number;
  confidence: number;
  explanation: string;
  distance_meters?: number;
  created_at: string;
}

export interface RelatedReportResponse {
  report_id: string;
  related_reports: RelationshipItem[];
  count: number;
}

export interface DuplicateReportResponse {
  report_id: string;
  duplicates: RelationshipItem[];
  count: number;
}

export interface HotspotSupportingReport {
  id: string;
  title: string;
  category: string;
  severity: string;
  status: string;
  latitude: number;
  longitude: number;
  created_at: string;
}

export interface HotspotItem {
  id: string;
  title: string;
  description?: string;
  category?: string;
  categories: string[];
  severity: string;
  status: 'ACTIVE' | 'STALE' | 'RESOLVED';
  center_latitude: number;
  center_longitude: number;
  radius: number;
  report_count: number;
  score: number;
  confidence: number;
  explanation?: string;
  algorithm_version: string;
  first_detected: string;
  last_updated: string;
  supporting_reports?: HotspotSupportingReport[];
}

export interface HotspotListResponse {
  hotspots: HotspotItem[];
  count: number;
}

export interface HotspotFilterParams {
  category?: string;
  severity?: string;
  status?: string;
  min_score?: number;
  date_from?: string;
  date_to?: string;
  limit?: number;
}
