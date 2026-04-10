import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Car,
  Droplets,
  Disc,
  Wrench,
  Fuel,
  FileText,
  Edit3,
} from 'lucide-react-native';
import { TabSelector } from '@/components/TabSelector';
import { SectionHeader } from '@/components/SectionHeader';
import { MaintenanceCard } from '@/components/MaintenanceCard';
import { FuelLogCard } from '@/components/FuelLogCard';
import { UpdateCarModal } from '@/components/UpdateCarModal';
import { AddMaintenanceModal } from '@/components/AddMaintenanceModal';
import { AddHistoryModal, ServiceRecordInput } from '@/components/AddHistoryModal';
import { AddFuelLogModal, FuelLogInput } from '@/components/AddFuelLogModal';
import { FuelLogDetailModal } from '@/components/FuelLogDetailModal';
import { ServiceHistoryDetailModal } from '@/components/ServiceHistoryDetailModal';
import { MaintenanceDetailModal, type MaintenanceItem } from '@/components/MaintenanceDetailModal';
import vehicleService, { CreateMaintenanceItemRequest, UpdateVehicleRequest } from '@/services/vehicle.service';
import { Colors, Typography, Spacing, Radius, Elevation } from '@/constants/theme';
import type { ServiceRecord, FuelLog } from '@/types';
import { useVehicles } from '@/contexts/VehicleContext';

// ───────────────── Mock Data ─────────────────

const TABS = ['Maintenance', 'History', 'Fuel'];

const MOCK_MAINTENANCE = [
  {
    id: '1',
    title: 'Oil Change',
    subtitle: 'Due in ~800 km',
    status: 'scheduled' as const,
    icon: <Droplets size={22} color={Colors.primary} strokeWidth={2} />,
  },
  {
    id: '2',
    title: 'Brake Pads',
    subtitle: 'Overdue by 200 km',
    status: 'priority' as const,
    icon: <Disc size={22} color={Colors.primary} strokeWidth={2} />,
  },
  {
    id: '3',
    title: 'Air Filter',
    subtitle: 'Good — replaced 3 months ago',
    status: 'good' as const,
    icon: <Wrench size={22} color={Colors.primary} strokeWidth={2} />,
  },
];

const MOCK_HISTORY: ServiceRecord[] = [
  {
    id: '1',
    vehicleId: 'v1',
    serviceType: 'Oil Change',
    date: '2026-01-15',
    mileageAtService: 43800,
    shopName: 'City Center Motors',
    cost: 45,
    currency: 'AZN',
  },
  {
    id: '2',
    vehicleId: 'v1',
    serviceType: 'Tire Rotation',
    date: '2025-11-02',
    mileageAtService: 41200,
    shopName: 'QuickFit Baku',
    cost: 30,
    currency: 'AZN',
  },
  {
    id: '3',
    vehicleId: 'v1',
    serviceType: 'Brake Inspection',
    date: '2025-08-19',
    mileageAtService: 38500,
    shopName: 'AutoCare Pro',
    cost: 25,
    currency: 'AZN',
  },
];

const MOCK_FUEL: FuelLog[] = [
  {
    id: '1',
    vehicleId: 'v1',
    date: '2026-03-20',
    liters: 42.5,
    costPerLiter: 1.10,
    totalCost: 46.75,
    mileageAtFill: 45100,
    station: 'SOCAR Station #12',
  },
  {
    id: '2',
    vehicleId: 'v1',
    date: '2026-03-08',
    liters: 38.0,
    costPerLiter: 1.10,
    totalCost: 41.80,
    mileageAtFill: 44600,
    station: 'Lukoil Nasimi',
  },
  {
    id: '3',
    vehicleId: 'v1',
    date: '2026-02-22',
    liters: 40.2,
    costPerLiter: 1.08,
    totalCost: 43.42,
    mileageAtFill: 44050,
  },
];

// ───────────────── Component ─────────────────

interface Props {
  route?: any;
  navigation?: any;
}

export const MyCarScreen: React.FC<Props> = ({ route, navigation }) => {
  const { primaryVehicle, refreshVehicles } = useVehicles();
  
  // Refresh vehicles when navigating to this screen
  useEffect(() => {
    const unsubscribe = navigation?.addListener('focus', () => {
      refreshVehicles();
    });
    
    return unsubscribe;
  }, [navigation, refreshVehicles]);

  const initialTab = route?.params?.initialTab || 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  
  // Use primary vehicle from context
  const vehicle = primaryVehicle || {
    id: '',
    make: 'Unknown',
    model: 'Unknown',
    year: 0,
    mileage: 0,
    isPrimary: true,
    userId: '',
    createdAt: '',
    updatedAt: '',
  };

  // Build vehicle display info
  const name = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
  const vehicleMileage = vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : '0 km';
  const healthScore = 85; // Mock health score for now
  const healthFraction = healthScore / 100;

  // Fetch maintenance items when vehicle is available
  useEffect(() => {
    const fetchMaintenanceItems = async () => {
      if (!vehicle.id) {
        setMaintenanceItems([]);
        setIsLoadingMaintenance(false);
        return;
      }

      try {
        setIsLoadingMaintenance(true);
        const items = await vehicleService.getMaintenanceItems(vehicle.id);
        
        // Convert API items to UI format
        const uiItems: MaintenanceItem[] = items.map(item => ({
          id: item.id,
          title: item.name,
          subtitle: item.notes || item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
          status: item.status === 'overdue' || item.status === 'due_soon' ? 'priority' : 
                 item.status === 'scheduled' ? 'scheduled' : 'good',
          icon: <Wrench size={22} color={Colors.primary} strokeWidth={2} />,
        }));
        
        setMaintenanceItems(uiItems);
      } catch (error) {
        console.error('Failed to fetch maintenance items:', error);
        setMaintenanceItems([]);
      } finally {
        setIsLoadingMaintenance(false);
      }
    };

    fetchMaintenanceItems();
  }, [vehicle.id]);

  // Fetch service records when vehicle is available
  useEffect(() => {
    const fetchServiceRecords = async () => {
      if (!vehicle.id) {
        setHistoryItems([]);
        setIsLoadingHistory(false);
        return;
      }

      try {
        setIsLoadingHistory(true);
        const records = await vehicleService.getServiceRecords(vehicle.id);
        
        // Convert API records to UI format (matching ServiceRecord interface)
        const uiRecords: ServiceRecord[] = records.map(record => ({
          id: record.id,
          vehicleId: record.vehicleId,
          serviceType: record.serviceType,
          date: record.date,
          mileageAtService: record.mileageAtService,
          shopName: record.shopName,
          cost: record.cost,
          currency: record.currency,
          receiptUri: record.receiptUrl,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt
        }));
        
        setHistoryItems(uiRecords);
      } catch (error) {
        console.error('Failed to fetch service records:', error);
        setHistoryItems([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchServiceRecords();
  }, [vehicle.id]);

  // Fetch fuel logs when vehicle is available
  useEffect(() => {
    const fetchFuelLogs = async () => {
      if (!vehicle.id) {
        setFuelItems([]);
        setIsLoadingFuel(false);
        return;
      }

      try {
        setIsLoadingFuel(true);
        const logs = await vehicleService.getFuelLogs(vehicle.id);
        
        // API returns FuelLog[] directly (no conversion needed)
        setFuelItems(logs);
      } catch (error) {
        console.error('Failed to fetch fuel logs:', error);
        setFuelItems([]);
      } finally {
        setIsLoadingFuel(false);
      }
    };

    fetchFuelLogs();
  }, [vehicle.id]);
  
  // Maintenance, history, and fuel state
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [isAddMaintenanceModalVisible, setIsAddMaintenanceModalVisible] = useState(false);
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(true);

  const [historyItems, setHistoryItems] = useState<ServiceRecord[]>([]);
  const [isAddHistoryModalVisible, setIsAddHistoryModalVisible] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const [fuelItems, setFuelItems] = useState<FuelLog[]>([]);
  const [isAddFuelLogModalVisible, setIsAddFuelLogModalVisible] = useState(false);
  const [isLoadingFuel, setIsLoadingFuel] = useState(true);
  
  // Fuel log detail modal state
  const [selectedFuelLog, setSelectedFuelLog] = useState<FuelLog | null>(null);
  const [isFuelLogDetailModalVisible, setIsFuelLogDetailModalVisible] = useState(false);
  
  // Service history detail modal state
  const [selectedServiceRecord, setSelectedServiceRecord] = useState<ServiceRecord | null>(null);
  const [isServiceHistoryDetailModalVisible, setIsServiceHistoryDetailModalVisible] = useState(false);
  
  // Maintenance detail modal state
  const [selectedMaintenanceItem, setSelectedMaintenanceItem] = useState<MaintenanceItem | null>(null);
  const [isMaintenanceDetailModalVisible, setIsMaintenanceDetailModalVisible] = useState(false);

  // Handler for saving vehicle details
  const handleSaveCarDetails = async (updateData: UpdateVehicleRequest) => {
    try {
      if (!vehicle.id) {
        console.error('Cannot update vehicle: No vehicle ID');
        return;
      }
      
      const finalUpdateData = { ...updateData };
      
      // If there's a local image to upload
      if (finalUpdateData.imageUrl && (finalUpdateData.imageUrl.startsWith('file:') || finalUpdateData.imageUrl.startsWith('content:'))) {
        await vehicleService.uploadVehicleImage(vehicle.id, finalUpdateData.imageUrl);
        // Remove it from the standard update since the upload endpoint already updates it in DB
        delete finalUpdateData.imageUrl;
      }
      
      // Call the API to update the vehicle remaining fields
      // If imageUrl was the only change, finalUpdateData will be empty here
      if (Object.keys(finalUpdateData).length > 0) {
        await vehicleService.updateVehicle(vehicle.id, finalUpdateData);
      }
      
      // Refresh the vehicle data from the context
      await refreshVehicles();
      
      // Close the modal
      setIsUpdateModalVisible(false);
      
      console.log('Vehicle updated successfully');
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      // Keep the modal open so user can try again
      // In a production app, you might want to show an error message to the user
    }
  };
  const handleFuelLogPress = (log: FuelLog) => {
    setSelectedFuelLog(log);
    setIsFuelLogDetailModalVisible(true);
  };

  const handleDeleteFuelLog = async (id: string) => {
    try {
      if (!vehicle.id) {
        console.error('Cannot delete fuel log: No vehicle ID');
        return;
      }
      
      // Call the API to delete the fuel log
      await vehicleService.deleteFuelLog(vehicle.id, id);
      
      // Update the UI by removing the deleted log
      setFuelItems(prev => prev.filter(log => log.id !== id));
      
      console.log('Fuel log deleted successfully');
    } catch (error) {
      console.error('Failed to delete fuel log:', error);
      // In a production app, you might want to show an error message to the user
    }
  };

  const handleUpdateFuelLog = async (id: string, updatedLog: FuelLog) => {
    try {
      if (!vehicle.id) {
        console.error('Cannot update fuel log: No vehicle ID');
        return;
      }
      
      // Prepare the update data
      const updateData = {
        date: updatedLog.date,
        fuelAmount: updatedLog.liters, // Assuming liters is the fuel amount
        fuelUnit: 'liters' as const, // Assuming liters since backend stores in liters
        pricePerUnit: updatedLog.costPerLiter,
        totalCost: updatedLog.totalCost,
        mileageAtFill: updatedLog.mileageAtFill,
        station: updatedLog.station,
      };
      
      // Call the API to update the fuel log
      const updatedApiLog = await vehicleService.updateFuelLog(vehicle.id, id, updateData);
      
      // Update the UI with the updated log
      setFuelItems(prev => 
        prev.map(log => log.id === id ? updatedApiLog : log)
      );
      
      setSelectedFuelLog(null);
      setIsFuelLogDetailModalVisible(false);
      
      console.log('Fuel log updated successfully');
    } catch (error) {
      console.error('Failed to update fuel log:', error);
      // Keep the modal open so user can try again
      // In a production app, you might want to show an error message to the user
    }
  };

  // Service record handlers
  const handleServiceRecordPress = (record: ServiceRecord) => {
    setSelectedServiceRecord(record);
    setIsServiceHistoryDetailModalVisible(true);
  };

  const handleDeleteServiceRecord = async (id: string) => {
    try {
      if (!vehicle.id) {
        console.error('Cannot delete service record: No vehicle ID');
        return;
      }
      
      // Call the API to delete the service record
      await vehicleService.deleteServiceRecord(vehicle.id, id);
      
      // Update the UI by removing the deleted record
      setHistoryItems(prev => prev.filter(record => record.id !== id));
      
      console.log('Service record deleted successfully');
    } catch (error) {
      console.error('Failed to delete service record:', error);
      // In a production app, you might want to show an error message to the user
    }
  };

  const handleUpdateServiceRecord = async (id: string, updatedRecord: ServiceRecord) => {
    try {
      if (!vehicle.id) {
        console.error('Cannot update service record: No vehicle ID');
        return;
      }
      
      // Prepare the update data (only include fields that can be updated)
      const updateData = {
        serviceType: updatedRecord.serviceType,
        date: updatedRecord.date,
        mileageAtService: updatedRecord.mileageAtService,
        shopName: updatedRecord.shopName,
        cost: updatedRecord.cost,
        currency: updatedRecord.currency,
        receiptUrl: updatedRecord.receiptUri, // Map receiptUri to receiptUrl for API
      };
      
      // Call the API to update the service record
      const updatedApiRecord = await vehicleService.updateServiceRecord(vehicle.id, id, updateData);
      
      // Update the UI with the updated record
      setHistoryItems(prev => 
        prev.map(record => record.id === id ? updatedApiRecord : record)
      );
      
      setSelectedServiceRecord(null);
      setIsServiceHistoryDetailModalVisible(false);
      
      console.log('Service record updated successfully');
    } catch (error) {
      console.error('Failed to update service record:', error);
      // Keep the modal open so user can try again
      // In a production app, you might want to show an error message to the user
    }
  };

  // Maintenance handlers
  const handleMaintenanceItemPress = (item: MaintenanceItem) => {
    setSelectedMaintenanceItem(item);
    setIsMaintenanceDetailModalVisible(true);
  };

  const handleDeleteMaintenanceItem = async (id: string) => {
    try {
      if (!vehicle.id) {
        console.error('Cannot delete maintenance item: No vehicle ID');
        return;
      }
      
      // Call the API to delete the maintenance item
      await vehicleService.deleteMaintenanceItem(vehicle.id, id);
      
      // Update the UI by removing the deleted item
      setMaintenanceItems(prev => prev.filter(item => item.id !== id));
      
      console.log('Maintenance item deleted successfully');
    } catch (error) {
      console.error('Failed to delete maintenance item:', error);
      // In a production app, you might want to show an error message to the user
    }
  };

  const handleUpdateMaintenanceItem = async (id: string, updatedItem: MaintenanceItem) => {
    try {
      if (!vehicle.id) {
        console.error('Cannot update maintenance item: No vehicle ID');
        return;
      }
      
      // Convert UI item to API format
      const apiData = {
        name: updatedItem.title,
        status: (updatedItem.status === 'priority' ? 'due_soon' : 
                updatedItem.status === 'scheduled' ? 'scheduled' : 'good') as 'overdue' | 'due_soon' | 'scheduled' | 'good',
        notes: updatedItem.subtitle,
      };
      
      // Call the API to update the maintenance item
      const updatedApiItem = await vehicleService.updateMaintenanceItem(vehicle.id, id, apiData);
      
      // Convert API response back to UI format
      const uiUpdatedItem: MaintenanceItem = {
        id: updatedApiItem.id,
        title: updatedApiItem.name,
        subtitle: updatedApiItem.notes || updatedApiItem.status.charAt(0).toUpperCase() + updatedApiItem.status.slice(1).replace('_', ' '),
        status: updatedApiItem.status === 'overdue' || updatedApiItem.status === 'due_soon' ? 'priority' : 
                updatedApiItem.status === 'scheduled' ? 'scheduled' : 'good',
        icon: <Wrench size={22} color={Colors.primary} strokeWidth={2} />,
      };
      
      // Update the UI with the updated item
      setMaintenanceItems(prev => 
        prev.map(item => item.id === id ? uiUpdatedItem : item)
      );
      
      setSelectedMaintenanceItem(null);
      setIsMaintenanceDetailModalVisible(false);
      
      console.log('Maintenance item updated successfully');
    } catch (error) {
      console.error('Failed to update maintenance item:', error);
      // Keep the modal open so user can try again
      // In a production app, you might want to show an error message to the user
    }
  };

  const renderEmptyState = (icon: React.ReactNode, message: string) => (
    <View style={styles.emptyState}>
      {icon}
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );

  // ── Tab Content Renderers ──

  const renderMaintenanceTab = () => (
    <View style={styles.tabContent}>
      <SectionHeader
        title="Maintenance Schedule"
        actionLabel="+"
        onAction={() => setIsAddMaintenanceModalVisible(true)}
      />
      {maintenanceItems.length === 0
        ? renderEmptyState(
            <Wrench size={40} color={Colors.outlineVariant} strokeWidth={1.5} />,
            'No maintenance items yet.\nAdd your first service schedule.',
          )
        : maintenanceItems.map((item) => (
            <MaintenanceCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              status={item.status}
              onPress={() => handleMaintenanceItemPress(item)}
            />
          ))}
    </View>
  );

  const renderHistoryTab = () => (
    <View style={styles.tabContent}>
      <SectionHeader
        title="Service History"
        actionLabel="+"
        onAction={() => setIsAddHistoryModalVisible(true)}
      />
      {historyItems.length === 0
        ? renderEmptyState(
            <FileText size={40} color={Colors.outlineVariant} strokeWidth={1.5} />,
            'No service records yet.\nLog your first service visit.',
          )
        : historyItems.map((record) => {
            const date = new Date(record.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });
            return (
              <TouchableOpacity
                key={record.id}
                style={styles.historyCard}
                activeOpacity={0.8}
                onPress={() => handleServiceRecordPress(record)}
              >
                <View style={styles.historyIconBadge}>
                  <Wrench size={22} color={Colors.primary} strokeWidth={2} />
                </View>
                <View style={styles.historyTextGroup}>
                  <Text style={styles.historyTitle}>{record.serviceType}</Text>
                  <Text style={styles.historySubtitle}>
                    {date}{record.shopName ? ` · ${record.shopName}` : ''}
                  </Text>
                </View>
                <View style={styles.historyRight}>
                  {record.cost != null && (
                    <Text style={styles.historyCost}>₼{record.cost}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
    </View>
  );

  const renderFuelTab = () => (
    <View style={styles.tabContent}>
      <SectionHeader
        title="Fuel Log"
        actionLabel="+"
        onAction={() => setIsAddFuelLogModalVisible(true)}
      />
      {fuelItems.length === 0
        ? renderEmptyState(
            <Fuel size={40} color={Colors.outlineVariant} strokeWidth={1.5} />,
            'No fuel entries yet.\nTrack your fill-ups to monitor efficiency.',
          )
        : fuelItems.map((log) => (
            <FuelLogCard
              key={log.id}
              log={log}
              onPress={() => handleFuelLogPress(log)}
            />
          ))}
    </View>
  );

  const TAB_RENDERERS = [renderMaintenanceTab, renderHistoryTab, renderFuelTab];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.wordmark}>Motorly</Text>
        </View>

        {/* ── Vehicle Card ── */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleHeader}>
            <View style={styles.vehicleTitleArea}>
              <Text style={styles.vehicleName}>{name}</Text>
              <View style={styles.licenseBadge}>
                <Text style={styles.licenseText}>{vehicle.licensePlate || 'N/A'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => setIsUpdateModalVisible(true)}>
              <Edit3 size={24} color={Colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.vehicleBody}>
            <View style={styles.odometerInfo}>
              <Text style={styles.odometerLabel}>CURRENT ODOMETER</Text>
              <Text style={styles.odometerValue}>{vehicleMileage}</Text>
            </View>
            <View style={[styles.carImagePlaceholder]}>
              {vehicle.imageUrl ? (
                <Image source={{ uri: vehicle.imageUrl }} style={{ width: '100%', height: '100%', borderRadius: Radius.sm }} resizeMode="cover" />
              ) : (
                <Car size={32} color={Colors.outlineVariant} strokeWidth={1.5} />
              )}
            </View>
          </View>
        </View>

        {/* ── Tab Selector ── */}
        <TabSelector
          tabs={TABS}
          activeIndex={activeTab}
          onTabPress={setActiveTab}
        />

        {/* ── Tab Content ── */}
        {TAB_RENDERERS[activeTab]()}
      </ScrollView>

      <UpdateCarModal
        visible={isUpdateModalVisible}
        onClose={() => setIsUpdateModalVisible(false)}
        vehicle={vehicle}
        onSave={handleSaveCarDetails}
      />

      <AddMaintenanceModal
        visible={isAddMaintenanceModalVisible}
        onClose={() => setIsAddMaintenanceModalVisible(false)}
        onSave={async (maintenanceData: CreateMaintenanceItemRequest) => {
          try {
            if (!vehicle.id) {
              console.error('Cannot create maintenance item: No vehicle ID');
              return;
            }
            
            // Call the API to create the maintenance item
            const newItem = await vehicleService.createMaintenanceItem(vehicle.id, maintenanceData);
            
            // Convert the API response to the format expected by the UI
            const uiItem: MaintenanceItem = {
              id: newItem.id,
              title: newItem.name,
              subtitle: newItem.notes || newItem.status.charAt(0).toUpperCase() + newItem.status.slice(1).replace('_', ' '),
              status: newItem.status === 'overdue' || newItem.status === 'due_soon' ? 'priority' : 
                     newItem.status === 'scheduled' ? 'scheduled' : 'good',
              icon: <Wrench size={22} color={Colors.primary} strokeWidth={2} />,
            };
            
            // Update the UI with the new item
            setMaintenanceItems((prev) => [uiItem, ...prev]);
            
            // Close the modal
            setIsAddMaintenanceModalVisible(false);
            
            console.log('Maintenance item created successfully');
          } catch (error) {
            console.error('Failed to create maintenance item:', error);
            // Keep the modal open so user can try again
            // The modal will handle resetting the saving state
            throw error; // Re-throw so the modal knows the save failed
          }
        }}
      />

      <AddHistoryModal
        visible={isAddHistoryModalVisible}
        onClose={() => setIsAddHistoryModalVisible(false)}
        onSave={async (newRecord: ServiceRecordInput) => {
          try {
            if (!vehicle.id) {
              console.error('Cannot create service record: No vehicle ID');
              return;
            }
            
            // Convert ServiceRecordInput to API format
            const serviceData = {
              serviceType: newRecord.serviceType,
              date: newRecord.date,
              mileageAtService: newRecord.mileageAtService,
              shopName: newRecord.shopName,
              cost: newRecord.cost,
              currency: newRecord.currency || 'AZN',
            };
            
            // Call the API to create the service record
            const newItem = await vehicleService.createServiceRecord(vehicle.id, serviceData);
            
            // Update the UI with the new record
            setHistoryItems((prev) => [newItem, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            
            // Close the modal
            setIsAddHistoryModalVisible(false);
            
            console.log('Service record created successfully');
          } catch (error) {
            console.error('Failed to create service record:', error);
            // Keep the modal open so user can try again
            // The modal will handle resetting the saving state
            throw error; // Re-throw so the modal knows the save failed
          }
        }}
      />

      <AddFuelLogModal
        visible={isAddFuelLogModalVisible}
        onClose={() => setIsAddFuelLogModalVisible(false)}
        onSave={async (newRecord: FuelLogInput) => {
          try {
            if (!vehicle.id) {
              console.error('Cannot create fuel log: No vehicle ID');
              return;
            }
            
            // Convert FuelLogInput to API format
            const fuelData = {
              date: newRecord.date || new Date().toISOString().split('T')[0],
              fuelAmount: newRecord.fuelAmount,
              fuelUnit: newRecord.fuelUnit,
              pricePerUnit: newRecord.pricePerUnit || 0,
              totalCost: newRecord.totalCost,
              mileageAtFill: vehicle.mileage || 0, // Use vehicle's current mileage
              station: newRecord.stationName,
            };
            
            // Call the API to create the fuel log
            const newItem = await vehicleService.createFuelLog(vehicle.id, fuelData);
            
            // Update the UI with the new log
            setFuelItems((prev) => [newItem, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            
            // Close the modal
            setIsAddFuelLogModalVisible(false);
            
            console.log('Fuel log created successfully');
          } catch (error) {
            console.error('Failed to create fuel log:', error);
            // Keep the modal open so user can try again
            // The modal will handle resetting the saving state
            throw error; // Re-throw so the modal knows the save failed
          }
        }}
      />

      <FuelLogDetailModal
        visible={isFuelLogDetailModalVisible}
        onClose={() => {
          setIsFuelLogDetailModalVisible(false);
          setSelectedFuelLog(null);
        }}
        log={selectedFuelLog}
        onDelete={handleDeleteFuelLog}
        onUpdate={handleUpdateFuelLog}
      />

      <ServiceHistoryDetailModal
        visible={isServiceHistoryDetailModalVisible}
        onClose={() => {
          setIsServiceHistoryDetailModalVisible(false);
          setSelectedServiceRecord(null);
        }}
        record={selectedServiceRecord}
        onDelete={handleDeleteServiceRecord}
        onUpdate={handleUpdateServiceRecord}
      />

      <MaintenanceDetailModal
        visible={isMaintenanceDetailModalVisible}
        onClose={() => {
          setIsMaintenanceDetailModalVisible(false);
          setSelectedMaintenanceItem(null);
        }}
        item={selectedMaintenanceItem}
        onDelete={handleDeleteMaintenanceItem}
        onUpdate={handleUpdateMaintenanceItem}
      />
    </SafeAreaView>
  );
};

// ───────────────── Styles ─────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  logo: {
    width: 26,
    height: 26,
  },
  wordmark: {
    fontSize: Typography.titleLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.primary,
  },

  // Vehicle Card (matches specific My Car design)
  vehicleCard: {
    backgroundColor: Colors.surfaceContainerLowest,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.xxl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    overflow: 'hidden',
    ...Elevation.floating,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  vehicleTitleArea: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  iconButton: {
    padding: Spacing.xs,
  },
  licenseBadge: {
    backgroundColor: Colors.surfaceContainerLow,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  licenseText: {
    fontFamily: Typography.fontBody,
    fontWeight: Typography.weightBold,
    fontSize: Typography.labelSm,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.5,
  },
  vehicleName: {
    fontSize: Typography.headlineLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
    marginBottom: Spacing.xs,
  },
  vehicleBody: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  carImagePlaceholder: {
    width: 140,
    height: 70,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  carImageFilled: {
    borderWidth: 0,
    backgroundColor: Colors.surface,
  },
  carImage: {
    width: '100%',
    height: '100%',
  },
  odometerInfo: {
    alignItems: 'flex-start',
  },
  odometerLabel: {
    fontSize: Typography.labelSm,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  odometerValue: {
    fontSize: Typography.titleLg,
    fontWeight: Typography.weightBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
  },

  // Tab content wrapper
  tabContent: {
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xl,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.huge,
    gap: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
  },

  // History card (inline, no separate component)
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  historyIconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: '#fce8e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTextGroup: {
    flex: 1,
  },
  historyTitle: {
    fontSize: Typography.titleSm,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    marginBottom: 2,
  },
  historySubtitle: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  historyRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  historyCost: {
    fontSize: Typography.titleSm,
    fontWeight: Typography.weightBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
  },
  historyMileage: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
});
