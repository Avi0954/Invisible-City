import { apiClient } from '../api/client';
import {
  AdminOverviewResponse,
  AdminReportListResponse,
  AdminReportQueryParams,
  AuditLogItem,
  FlagItem,
} from '../types/admin';

export const fetchAdminOverview = async (): Promise<AdminOverviewResponse> => {
  const response = await apiClient.get<AdminOverviewResponse>('/admin/overview');
  return response.data;
};

export const fetchAdminReports = async (
  params?: AdminReportQueryParams
): Promise<AdminReportListResponse> => {
  const response = await apiClient.get<AdminReportListResponse>('/admin/reports', { params });
  return response.data;
};

export const verifyReport = async (
  reportId: string,
  verification_status: string
): Promise<{ status: string; verification_status: string; priority_score: number; priority_level: string }> => {
  const response = await apiClient.patch(`/admin/reports/${reportId}/verify`, {
    verification_status,
  });
  return response.data;
};

export const updateReportStatus = async (
  reportId: string,
  status: string
): Promise<{ status: string; new_status: string }> => {
  const response = await apiClient.patch(`/admin/reports/${reportId}/status`, {
    status,
  });
  return response.data;
};

export const fetchAdminAuditLogs = async (): Promise<AuditLogItem[]> => {
  const response = await apiClient.get<AuditLogItem[]>('/admin/audit-logs');
  return response.data;
};

export const fetchAdminFlags = async (): Promise<FlagItem[]> => {
  const response = await apiClient.get<FlagItem[]>('/admin/flags');
  return response.data;
};

export const flagReport = async (
  reportId: string,
  reason: string,
  details?: string
): Promise<{ id: string; report_id: string; reason: string }> => {
  const response = await apiClient.post(`/reports/${reportId}/flag`, {
    reason,
    details,
  });
  return response.data;
};
