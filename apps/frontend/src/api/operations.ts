import { apiClient } from './client';

export interface ETAPrediction {
  eta_minutes: number;
  condition: string;
  distance_km: number;
}

export interface AnalyticsTrend {
  date: string;
  passengers: number;
}

export interface AnalyticsSummary {
  active_trips: number;
  passengers_today: number;
  estimated_revenue: number;
  trend: AnalyticsTrend[];
}

export const operationsApi = {
  predictEta: async (startStopId: string, endStopId: string): Promise<ETAPrediction> => {
    const response = await apiClient.get<ETAPrediction>('/operations/predict-eta/', {
      params: { start_stop_id: startStopId, end_stop_id: endStopId }
    });
    return response.data;
  },
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    const response = await apiClient.get<AnalyticsSummary>('/operations/analytics-summary/');
    return response.data;
  }
};
