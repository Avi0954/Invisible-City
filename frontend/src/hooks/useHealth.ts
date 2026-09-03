import { useQuery } from '@tanstack/react-query';
import { healthService } from '../services/healthService';

export function useHealth() {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: healthService.getHealthStatus,
    refetchInterval: 15000, // Poll health every 15 seconds
    retry: 2,
  });
}
