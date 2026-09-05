import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReportAnalysis, triggerReportAnalysis } from '../services/aiService';
import { AIAnalysisResponse, TriggerAnalysisResponse } from '../types/ai';

export const useReportAnalysis = (reportId: string) => {
  return useQuery<AIAnalysisResponse>({
    queryKey: ['report-analysis', reportId],
    queryFn: () => getReportAnalysis(reportId),
    enabled: !!reportId,
    refetchInterval: (query) => {
      const status = query.state.data?.processing_status;
      if (status === 'PENDING' || status === 'PROCESSING') {
        return 2000; // Poll every 2 seconds while processing
      }
      return false;
    },
    retry: false, // Don't retry 404 if analysis not yet triggered
  });
};

export const useAnalyzeReport = () => {
  const queryClient = useQueryClient();

  return useMutation<TriggerAnalysisResponse, Error, string>({
    mutationFn: (reportId: string) => triggerReportAnalysis(reportId),
    onSuccess: (_, reportId) => {
      queryClient.invalidateQueries({ queryKey: ['report-analysis', reportId] });
      queryClient.invalidateQueries({ queryKey: ['report', reportId] });
    },
  });
};
