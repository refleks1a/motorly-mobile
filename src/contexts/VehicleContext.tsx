import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import vehicleService, { Vehicle } from '@/services/vehicle.service';

interface VehicleContextType {
  vehicles: Vehicle[];
  primaryVehicle: Vehicle | null;
  isLoading: boolean;
  error: string | null;
  refreshVehicles: () => Promise<Vehicle[]>;
  selectPrimaryVehicle: (vehicleId: string) => void;
}

const VehicleContext = createContext<VehicleContextType | undefined>(undefined);

interface VehicleProviderProps {
  children: ReactNode;
}

export const VehicleProvider: React.FC<VehicleProviderProps> = ({ children }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [primaryVehicle, setPrimaryVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch vehicles on mount
  useEffect(() => {
    refreshVehicles();
  }, []);

  const refreshVehicles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedVehicles = await vehicleService.getVehicles();
      setVehicles(fetchedVehicles);
      
      // Set primary vehicle (first one or the one marked as primary)
      const primary = fetchedVehicles.find((v) => v.isPrimary) || fetchedVehicles[0];
      setPrimaryVehicle(primary || null);
      
      return fetchedVehicles;
    } catch (err) {
      console.error('Failed to fetch vehicles:', err);
      setError(err instanceof Error ? err.message : 'Failed to load vehicles');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const selectPrimaryVehicle = (vehicleId: string) => {
    const selected = vehicles.find((v) => v.id === vehicleId);
    if (selected) {
      setPrimaryVehicle(selected);
    }
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        primaryVehicle,
        isLoading,
        error,
        refreshVehicles,
        selectPrimaryVehicle,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
};

export const useVehicles = () => {
  const context = useContext(VehicleContext);
  if (context === undefined) {
    throw new Error('useVehicles must be used within a VehicleProvider');
  }
  return context;
};
