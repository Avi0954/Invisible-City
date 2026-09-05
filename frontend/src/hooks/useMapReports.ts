import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchNearbyReports } from '../services/mapService';
import { MapQueryParams, MapReportListResponse } from '../types/map';

export const useMapReports = (initialParams: MapQueryParams) => {
  const [params, setParams] = useState<MapQueryParams>(initialParams);
  const [debouncedParams, setDebouncedParams] = useState<MapQueryParams>(initialParams);

  // Debounce parameter updates by 300ms to avoid flooding API during pan/zoom
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedParams(params);
    }, 300);

    return () => clearTimeout(handler);
  }, [params]);

  const query = useQuery<MapReportListResponse>({
    queryKey: ['map-reports', debouncedParams],
    queryFn: ({ signal }) => fetchNearbyReports(debouncedParams, signal),
    placeholderData: (previousData) => previousData, // Smooth viewport marker updates
    staleTime: 5000,
  });

  return {
    ...query,
    params,
    setParams,
  };
};
