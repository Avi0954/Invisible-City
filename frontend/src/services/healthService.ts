import { apiClient } from '../api/client';
import { HealthStatusResponse } from '../types/api';

export const healthService = {
  getHealthStatus: async (): Promise<HealthStatusResponse> => {
    const response = await apiClient.get<HealthStatusResponse>('/health');
    return response.data;
  },
};
