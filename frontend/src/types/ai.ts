import { ReportCategory, ReportSeverity } from './report';

export type AIProcessingStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REVIEW_REQUIRED';

export interface AIAnalysisResponse {
  id: string;
  report_id: string;
  provider?: string;
  model?: string;
  model_version?: string;
  prompt_version?: string;
  category?: ReportCategory;
  severity?: ReportSeverity;
  summary?: string;
  confidence?: number;
  keywords: string[];
  observations: string[];
  processing_status: AIProcessingStatus;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface TriggerAnalysisResponse {
  report_id: string;
  analysis_id: string;
  processing_status: AIProcessingStatus;
  message: string;
}
