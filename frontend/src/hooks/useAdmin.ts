import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminOverview,
  fetchAdminReports,
  verifyReport,
  updateReportStatus,
  fetchAdminAuditLogs,
  fetchAdminFlags,
  flagReport,
} from '../services/adminService';
import {
  AdminOverviewResponse,
  AdminReportListResponse,
  AdminReportQueryParams,
  AuditLogItem,
  FlagItem,
} from '../types/admin';

export const useAdminOverview = () => {
  return useQuery<AdminOverviewResponse>({
    queryKey: ['admin-overview'],
    queryFn: fetchAdminOverview,
    staleTime: 10000,
  });
};

export const useAdminReports = (params?: AdminReportQueryParams) => {
  return useQuery<AdminReportListResponse>({
    queryKey: ['admin-reports', params],
    queryFn: () => fetchAdminReports(params),
    staleTime: 5000,
  });
};

export const useVerifyReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, verification_status }: { reportId: string; verification_status: string }) =>
      verifyReport(reportId, verification_status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useUpdateReportStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: string }) =>
      updateReportStatus(reportId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      queryClient.invalidateQueries({ queryKey: ['admin-overview'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
};

export const useAdminAuditLogs = () => {
  return useQuery<AuditLogItem[]>({
    queryKey: ['admin-audit-logs'],
    queryFn: fetchAdminAuditLogs,
    staleTime: 10000,
  });
};

export const useAdminFlags = () => {
  return useQuery<FlagItem[]>({
    queryKey: ['admin-flags'],
    queryFn: fetchAdminFlags,
    staleTime: 10000,
  });
};

export const useFlagReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, reason, details }: { reportId: string; reason: string; details?: string }) =>
      flagReport(reportId, reason, details),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-flags'] });
    },
  });
};
