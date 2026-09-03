import { apiClient } from '../api/client';
import {
  Report,
  ReportCreateData,
  ReportFilters,
  ReportListResponse,
  ReportMedia
} from '../types/report';

export const reportService = {
  createReport: async (data: ReportCreateData): Promise<Report> => {
    const response = await apiClient.post<Report>('/reports', data);
    return response.data;
  },

  getReports: async (filters: ReportFilters = {}): Promise<ReportListResponse> => {
    const response = await apiClient.get<ReportListResponse>('/reports', {
      params: filters,
    });
    return response.data;
  },

  getReportById: async (id: string): Promise<Report> => {
    const response = await apiClient.get<Report>(`/reports/${id}`);
    return response.data;
  },

  updateReport: async (id: string, data: Partial<ReportCreateData>): Promise<Report> => {
    const response = await apiClient.patch<Report>(`/reports/${id}`, data);
    return response.data;
  },

  deleteReport: async (id: string): Promise<void> => {
    await apiClient.delete(`/reports/${id}`);
  },

  uploadMedia: async (
    reportId: string,
    file: File,
    onProgress?: (percent: number) => void
  ): Promise<ReportMedia> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<ReportMedia>(`/reports/${reportId}/media`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      },
    });

    return response.data;
  },

  deleteMedia: async (mediaId: string): Promise<void> => {
    await apiClient.delete(`/media/${mediaId}`);
  },
};
