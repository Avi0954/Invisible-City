export interface HealthStatusResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  environment: string;
  database_connected: boolean;
  database?: string;
  postgis?: boolean;
  pgvector?: boolean;
  database_message?: string;
  version: string;
}

export interface ApiErrorResponse {
  error: {
    message: string;
    status_code: number;
    details?: Record<string, unknown>;
    request_id?: string;
  };
}
