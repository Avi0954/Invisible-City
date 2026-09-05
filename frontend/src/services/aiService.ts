import { apiClient } from '../api/client';


import { AIAnalysisResponse, TriggerAnalysisResponse } from '../types/ai';

export const triggerReportAnalysis = async (reportId: string): Promise<TriggerAnalysisResponse> => {
  const response = await apiClient.post<TriggerAnalysisResponse>(`/reports/${reportId}/analyze`);
  return response.data;
};

export const getReportAnalysis = async (reportId: string): Promise<AIAnalysisResponse> => {
  const response = await apiClient.get<AIAnalysisResponse>(`/reports/${reportId}/analysis`);
  return response.data;
};

