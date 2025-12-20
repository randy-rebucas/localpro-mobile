/**
 * Hook for checking app health status via the health endpoint
 */

import { API_ENDPOINTS, apiClient } from '@localpro/api';
import { useCallback, useEffect, useState } from 'react';

export type HealthStatus = 'healthy' | 'unhealthy' | 'checking' | 'unknown';

interface HealthResponse {
  status?: string;
  message?: string;
  timestamp?: string;
  [key: string]: any;
}

export function useAppHealth(checkInterval: number = 30000) {
  const [status, setStatus] = useState<HealthStatus>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    try {
      setStatus('checking');
      setError(null);
      
      const response = await apiClient.get<HealthResponse>(API_ENDPOINTS.health);
      
      // Check if the response indicates a healthy status
      // Common health check responses: { status: 'ok' } or { status: 'healthy' }
      const isHealthy = 
        response?.status === 'ok' || 
        response?.status === 'healthy' ||
        (response && Object.keys(response).length > 0); // If we get any response, consider it healthy
      
      setStatus(isHealthy ? 'healthy' : 'unhealthy');
      setLastChecked(new Date());
    } catch (err: any) {
      console.error('Health check failed:', err);
      setStatus('unhealthy');
      setError(err?.message || 'Failed to check health status');
      setLastChecked(new Date());
    }
  }, []);

  useEffect(() => {
    // Check immediately on mount
    checkHealth();

    // Set up interval to check periodically
    const interval = setInterval(checkHealth, checkInterval);

    return () => clearInterval(interval);
  }, [checkInterval, checkHealth]);

  return {
    status,
    lastChecked,
    error,
    checkHealth, // Expose manual check function
  };
}

