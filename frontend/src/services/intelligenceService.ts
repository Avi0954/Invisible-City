import { apiClient } from '../api/client';
import {
  RelatedReportResponse,
  DuplicateReportResponse,
  HotspotListResponse,
  HotspotItem,
  HotspotFilterParams,
} from '../types/intelligence';

export const fetchRelatedReports = async (
  reportId: string
): Promise<RelatedReportResponse> => {
  const response = await apiClient.get<RelatedReportResponse>(`/reports/${reportId}/related`);
  return response.data;
};

export const fetchDuplicateReports = async (
  reportId: string
): Promise<DuplicateReportResponse> => {
  const response = await apiClient.get<DuplicateReportResponse>(`/reports/${reportId}/duplicates`);
  return response.data;
};

export const fetchHotspots = async (
  params?: HotspotFilterParams,
  signal?: AbortSignal
): Promise<HotspotListResponse> => {
  const response = await apiClient.get<HotspotListResponse>('/hotspots', {
    params,
    signal,
  });
  return response.data;
};

export const fetchHotspotDetail = async (
  hotspotId: string
): Promise<HotspotItem> => {
  const response = await apiClient.get<HotspotItem>(`/hotspots/${hotspotId}`);
  return response.data;
};
