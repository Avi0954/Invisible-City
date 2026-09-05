import { apiClient } from '../api/client';
import { MapQueryParams, MapReportListResponse } from '../types/map';

export const fetchNearbyReports = async (
  params: MapQueryParams,
  signal?: AbortSignal
): Promise<MapReportListResponse> => {
  const response = await apiClient.get<MapReportListResponse>('/reports/nearby', {
    params,
    signal,
  });
  return response.data;
};
