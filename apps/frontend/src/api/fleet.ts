import { apiClient } from './client';

export interface Vehicle {
  id: string;
  registration_number: string;
  capacity: number;
  status: 'ACTIVE' | 'MAINTENANCE' | 'OUT_OF_SERVICE';
}

export const fleetApi = {
  getVehicles: async (): Promise<Vehicle[]> => {
    const response = await apiClient.get<Vehicle[]>('/vehicles/');
    return response.data;
  },
  createVehicle: async (data: Partial<Vehicle>): Promise<Vehicle> => {
    const response = await apiClient.post<Vehicle>('/vehicles/', data);
    return response.data;
  }
};
