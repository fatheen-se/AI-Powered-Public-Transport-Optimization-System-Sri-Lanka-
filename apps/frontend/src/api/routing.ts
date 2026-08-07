import { apiClient } from './client';

export interface Stop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  zone: string;
}

export interface Route {
  id: string;
  route_number: string;
  start_location: Stop;
  end_location: Stop;
  polyline: { lat: number, lng: number }[];
}

export const routingApi = {
  getStops: async (): Promise<Stop[]> => {
    const response = await apiClient.get<Stop[]>('/stops/');
    return response.data;
  },
  getRoutes: async (): Promise<Route[]> => {
    const response = await apiClient.get<Route[]>('/routes/');
    return response.data;
  },
  createRoute: async (data: Partial<Route>): Promise<Route> => {
    const response = await apiClient.post<Route>('/routes/', data);
    return response.data;
  },
  createStop: async (data: Partial<Stop>): Promise<Stop> => {
    const response = await apiClient.post<Stop>('/stops/', data);
    return response.data;
  },
  updateRoute: async (id: string, data: Partial<Route>): Promise<Route> => {
    const response = await apiClient.patch<Route>(`/routes/${id}/`, data);
    return response.data;
  },
  deleteRoute: async (id: string): Promise<void> => {
    await apiClient.delete(`/routes/${id}/`);
  },
  updateStop: async (id: string, data: Partial<Stop>): Promise<Stop> => {
    const response = await apiClient.patch<Stop>(`/stops/${id}/`, data);
    return response.data;
  },
  deleteStop: async (id: string): Promise<void> => {
    await apiClient.delete(`/stops/${id}/`);
  }
};
