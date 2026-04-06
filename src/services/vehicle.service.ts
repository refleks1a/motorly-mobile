import api from './api';
import type { FuelLog } from '@/types';

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage?: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateVehicleRequest {
  make: string;
  model: string;
  year: number;
  mileage?: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
}

export interface UpdateVehicleRequest {
  make?: string;
  model?: string;
  year?: number;
  mileage?: number;
  vin?: string;
  licensePlate?: string;
  color?: string;
}

export interface MaintenanceItem {
  id: string;
  name: string;
  status: 'overdue' | 'due_soon' | 'scheduled' | 'good';
  dueInKm?: number;
  dueDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMaintenanceItemRequest {
  name: string;
  status: 'overdue' | 'due_soon' | 'scheduled' | 'good';
  dueInKm?: number;
  dueDate?: string;
  notes?: string;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  serviceType: string;
  date: string;
  mileageAtService: number;
  shopName?: string;
  cost?: number;
  currency?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

class VehicleService {
  // Get all vehicles for the authenticated user
  async getVehicles(): Promise<Vehicle[]> {
    const response = await api.get<Vehicle[]>('/vehicles');
    return response.data;
  }

  // Get a specific vehicle by ID
  async getVehicle(vehicleId: string): Promise<Vehicle> {
    const response = await api.get<Vehicle>(`/vehicles/${vehicleId}`);
    return response.data;
  }

  // Create a new vehicle
  async createVehicle(vehicleData: CreateVehicleRequest): Promise<Vehicle> {
    const response = await api.post<Vehicle>('/vehicles', vehicleData);
    return response.data;
  }

  // Update an existing vehicle
  async updateVehicle(vehicleId: string, vehicleData: UpdateVehicleRequest): Promise<Vehicle> {
    const response = await api.put<Vehicle>(`/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  }

  // Delete a vehicle
  async deleteVehicle(vehicleId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/vehicles/${vehicleId}`);
    return response.data;
  }

  // Set a vehicle as primary
  async setPrimaryVehicle(vehicleId: string): Promise<Vehicle> {
    const response = await api.post<Vehicle>(`/vehicles/${vehicleId}/primary`);
    return response.data;
  }

  // Get maintenance items for a vehicle
  async getMaintenanceItems(vehicleId: string): Promise<MaintenanceItem[]> {
    const response = await api.get<MaintenanceItem[]>(`/vehicles/${vehicleId}/maintenance`);
    return response.data;
  }

  // Get service records for a vehicle
  async getServiceRecords(vehicleId: string): Promise<ServiceRecord[]> {
    const response = await api.get<ServiceRecord[]>(`/vehicles/${vehicleId}/service-records`);
    return response.data;
  }

  // Get fuel logs for a vehicle
  async getFuelLogs(vehicleId: string): Promise<FuelLog[]> {
    const response = await api.get<FuelLog[]>(`/vehicles/${vehicleId}/fuel-logs`);
    return response.data;
  }

  // Create a maintenance item
  async createMaintenanceItem(
    vehicleId: string,
    maintenanceData: CreateMaintenanceItemRequest
  ): Promise<MaintenanceItem> {
    const response = await api.post<MaintenanceItem>(`/vehicles/${vehicleId}/maintenance`, maintenanceData);
    return response.data;
  }

  // Delete a maintenance item
  async deleteMaintenanceItem(
    vehicleId: string,
    maintenanceItemId: string
  ): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/vehicles/${vehicleId}/maintenance/${maintenanceItemId}`);
    return response.data;
  }

  // Update a maintenance item
  async updateMaintenanceItem(
    vehicleId: string,
    maintenanceItemId: string,
    maintenanceData: Partial<CreateMaintenanceItemRequest>
  ): Promise<MaintenanceItem> {
    const response = await api.put<MaintenanceItem>(`/vehicles/${vehicleId}/maintenance/${maintenanceItemId}`, maintenanceData);
    return response.data;
  }

  // Create a service record
  async createServiceRecord(
    vehicleId: string,
    serviceData: Omit<ServiceRecord, 'id' | 'vehicleId' | 'createdAt' | 'updatedAt'>
  ): Promise<ServiceRecord> {
    const response = await api.post<ServiceRecord>(`/vehicles/${vehicleId}/service-records`, serviceData);
    return response.data;
  }

  // Update a service record
  async updateServiceRecord(
    vehicleId: string,
    recordId: string,
    serviceData: Partial<Omit<ServiceRecord, 'id' | 'vehicleId' | 'createdAt' | 'updatedAt'>>
  ): Promise<ServiceRecord> {
    const response = await api.put<ServiceRecord>(`/vehicles/${vehicleId}/service-records/${recordId}`, serviceData);
    return response.data;
  }

  // Delete a service record
  async deleteServiceRecord(
    vehicleId: string,
    recordId: string
  ): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/vehicles/${vehicleId}/service-records/${recordId}`);
    return response.data;
  }

  // Create a fuel log
  async createFuelLog(
    vehicleId: string,
    fuelData: {
      date: string;
      fuelAmount: number;
      fuelUnit: 'liters' | 'gallons';
      pricePerUnit: number;
      totalCost: number;
      mileageAtFill: number;
      station?: string;
    }
  ): Promise<FuelLog> {
    const response = await api.post<FuelLog>(`/vehicles/${vehicleId}/fuel-logs`, fuelData);
    return response.data;
  }

  // Update a fuel log
  async updateFuelLog(
    vehicleId: string,
    logId: string,
    fuelData: Partial<{
      date: string;
      fuelAmount: number;
      fuelUnit: 'liters' | 'gallons';
      pricePerUnit: number;
      totalCost: number;
      mileageAtFill: number;
      station?: string;
    }>
  ): Promise<FuelLog> {
    const response = await api.put<FuelLog>(`/vehicles/${vehicleId}/fuel-logs/${logId}`, fuelData);
    return response.data;
  }

  // Delete a fuel log
  async deleteFuelLog(
    vehicleId: string,
    logId: string
  ): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/vehicles/${vehicleId}/fuel-logs/${logId}`);
    return response.data;
  }
}

export default new VehicleService();