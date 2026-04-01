// Shared TypeScript types for Motorly

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  licensePlate?: string;
  isPrimary: boolean;
}

export interface MaintenanceItem {
  id: string;
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
  receiptUri?: string;
}

export interface Shop {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  isOpen: boolean;
  closingTime?: string;
  address: string;
  phone?: string;
  specialties: string[];
  latitude: number;
  longitude: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  diagnosisCard?: DiagnosisCard;
}

export interface DiagnosisCard {
  likelyIssue: string;
  recommendation: string;
  imageUrl?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string;
  liters: number;
  costPerLiter: number;
  totalCost: number;
  mileageAtFill: number;
  station?: string;
}
