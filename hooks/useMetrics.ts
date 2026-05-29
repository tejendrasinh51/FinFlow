import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface UseMetricsOptions {
  types?: string[];
  from?: string;
  to?: string;
  groupBy?: 'day' | 'month' | 'year';
}

export function useMetrics({ types = [], from, to, groupBy }: UseMetricsOptions = {}) {
  const [data, setData] = useState<any[]>([]);
  const [liveValues, setLiveValues] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Core metric retrieval function
  const fetchMetrics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      if (types.length > 0) queryParams.set('types', types.join(','));
      if (from) queryParams.set('from', from);
      if (to) queryParams.set('to', to);
      if (groupBy) queryParams.set('groupBy', groupBy);

      const response = await fetch(`/api/metrics?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to retrieve metrics: HTTP status ${response.status}`);
      }
      
      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.error || 'Unknown server error fetching metrics.');
      }

      setData(resData.data || []);
      
      // Seed live values with the latest records
      const initialLives: Record<string, number> = {};
      if (resData.data) {
        resData.data.forEach((m: any) => {
          if (m.metric_type && m.value !== undefined) {
            initialLives[m.metric_type] = parseFloat(m.value);
          }
        });
      }
      setLiveValues(initialLives);

    } catch (err: any) {
      console.error('Metrics fetch failed:', err);
      setError(err.message || 'Error loading financial dataset.');
    } finally {
      setIsLoading(false);
    }
  }, [types.join(','), from, to, groupBy]);

  // Execute initial load
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // 2. Setup WebSocket message handler to merge live updates
  const handleWebSocketMessage = useCallback((event: MessageEvent) => {
    try {
      const payload = JSON.parse(event.data);
      if (payload.type === 'metric_update') {
        const metricType = payload.metric_type;
        const newValue = payload.value;
        const recordedAt = payload.recorded_at;

        // Verify if this metric type is scoped in our hook
        if (types.length === 0 || types.includes(metricType)) {
          console.log(`[WS Stream Ingest] Scoped update: ${metricType} -> ${newValue}`);

          // A. Update latest live single values
          setLiveValues(prev => ({
            ...prev,
            [metricType]: newValue,
          }));

          // B. Update timeseries cache list (append or merge)
          setData(prevData => {
            const updated = [...prevData];
            
            // Check if record exists in the list for the exact timestamp
            const existingIdx = updated.findIndex(
              (item) => item.metric_type === metricType && 
              new Date(item.recorded_at).getTime() === new Date(recordedAt).getTime()
            );

            if (existingIdx > -1) {
              updated[existingIdx] = {
                ...updated[existingIdx],
                value: newValue,
              };
            } else {
              updated.push({
                metric_type: metricType,
                value: newValue,
                recorded_at: recordedAt,
              });
              // Keep sorted
              updated.sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
            }

            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Failed to parse incoming WebSocket stream packet:', err);
    }
  }, [types.join(',')]);

  const { connected: isLive } = useWebSocket({
    onMessage: handleWebSocketMessage,
  });

  return {
    data,
    liveValues,
    isLoading,
    isLive,
    error,
    refetch: fetchMetrics,
  };
}
