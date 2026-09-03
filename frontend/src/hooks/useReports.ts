import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportService } from '../services/reportService';
import { ReportCreateData, ReportFilters } from '../types/report';

export function useReports(filters: ReportFilters = {}) {
  return useQuery({
    queryKey: ['reports', filters],
    queryFn: () => reportService.getReports(filters),
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: ['report', id],
    queryFn: () => reportService.getReportById(id),
    enabled: !!id,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReportCreateData) => reportService.createReport(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ReportCreateData> }) =>
      reportService.updateReport(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      queryClient.invalidateQueries({ queryKey: ['report', variables.id] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reportService.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}

export function useUploadMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      reportId,
      file,
      onProgress,
    }: {
      reportId: string;
      file: File;
      onProgress?: (percent: number) => void;
    }) => reportService.uploadMedia(reportId, file, onProgress),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ mediaId, reportId }: { mediaId: string; reportId: string }) =>
      reportService.deleteMedia(mediaId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['report', variables.reportId] });
    },
  });
}
