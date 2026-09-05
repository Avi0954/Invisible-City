import { useQuery } from '@tanstack/react-query';
import {
  fetchRelatedReports,
  fetchDuplicateReports,
  fetchHotspots,
  fetchHotspotDetail,
} from '../services/intelligenceService';
import {
  RelatedReportResponse,
  DuplicateReportResponse,
  HotspotListResponse,
  HotspotItem,
  HotspotFilterParams,
} from '../types/intelligence';

export const useRelatedReports = (reportId: string) => {
  return useQuery<RelatedReportResponse>({
    queryKey: ['related-reports', reportId],
    queryFn: () => fetchRelatedReports(reportId),
    enabled: Boolean(reportId),
    staleTime: 10000,
  });
};

export const useDuplicateReports = (reportId: string) => {
  return useQuery<DuplicateReportResponse>({
    queryKey: ['duplicate-reports', reportId],
    queryFn: () => fetchDuplicateReports(reportId),
    enabled: Boolean(reportId),
    staleTime: 10000,
  });
};

export const useHotspots = (params?: HotspotFilterParams) => {
  return useQuery<HotspotListResponse>({
    queryKey: ['hotspots', params],
    queryFn: ({ signal }) => fetchHotspots(params, signal),
    staleTime: 15000,
  });
};

export const useHotspotDetail = (hotspotId?: string) => {
  return useQuery<HotspotItem>({
    queryKey: ['hotspot-detail', hotspotId],
    queryFn: () => fetchHotspotDetail(hotspotId!),
    enabled: Boolean(hotspotId),
    staleTime: 15000,
  });
};
