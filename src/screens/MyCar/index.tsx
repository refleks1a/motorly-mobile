import React, { useState } from 'react';
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
import { AddMaintenanceModal, MaintenanceRecordInput } from '@/components/AddMaintenanceModal';
import { AddHistoryModal, ServiceRecordInput } from '@/components/AddHistoryModal';
import { AddFuelLogModal, FuelLogInput } from '@/components/AddFuelLogModal';
import { FuelLogDetailModal } from '@/components/FuelLogDetailModal';
import { ServiceHistoryDetailModal } from '@/components/ServiceHistoryDetailModal';
import { MaintenanceDetailModal, type MaintenanceItem } from '@/components/MaintenanceDetailModal';
import { Colors, Typography, Spacing, Radius, Elevation } from '@/constants/theme';
import type { ServiceRecord, FuelLog } from '@/types';

// ───────────────── Mock Data ─────────────────

const INITIAL_VEHICLE = {
  productionYear: '2019',
  brand: 'Honda',
  model: 'Civic',
  mileage: '45,230 km',
  healthScore: 85,
  licensePlate: 'ABC-1234',
  imageUrl: '',
};

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
}

export const MyCarScreen: React.FC<Props> = ({ route }) => {
  const initialTab = route?.params?.initialTab || 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [vehicle, setVehicle] = useState(INITIAL_VEHICLE);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(MOCK_MAINTENANCE);
  const [isAddMaintenanceModalVisible, setIsAddMaintenanceModalVisible] = useState(false);

  const [historyItems, setHistoryItems] = useState(MOCK_HISTORY);
  const [isAddHistoryModalVisible, setIsAddHistoryModalVisible] = useState(false);

  const [fuelItems, setFuelItems] = useState(MOCK_FUEL);
  const [isAddFuelLogModalVisible, setIsAddFuelLogModalVisible] = useState(false);
  
  // Fuel log detail modal state
  const [selectedFuelLog, setSelectedFuelLog] = useState<FuelLog | null>(null);
  const [isFuelLogDetailModalVisible, setIsFuelLogDetailModalVisible] = useState(false);
  
  // Service history detail modal state
  const [selectedServiceRecord, setSelectedServiceRecord] = useState<ServiceRecord | null>(null);
  const [isServiceHistoryDetailModalVisible, setIsServiceHistoryDetailModalVisible] = useState(false);
  
  // Maintenance detail modal state
  const [selectedMaintenanceItem, setSelectedMaintenanceItem] = useState<MaintenanceItem | null>(null);
  const [isMaintenanceDetailModalVisible, setIsMaintenanceDetailModalVisible] = useState(false);

  const { productionYear, brand, model, mileage, healthScore, licensePlate, imageUrl } = vehicle;
  const name = `${productionYear} ${brand} ${model}`;
  const healthFraction = healthScore / 100;

  const handleSaveCarDetails = (newDetails: Partial<typeof INITIAL_VEHICLE>) => {
    setVehicle(prev => ({
      ...prev,
      ...newDetails,
    }));
  };

  // Fuel log handlers
  const handleFuelLogPress = (log: FuelLog) => {
    setSelectedFuelLog(log);
    setIsFuelLogDetailModalVisible(true);
  };

  const handleDeleteFuelLog = (id: string) => {
    setFuelItems(prev => prev.filter(log => log.id !== id));
  };

  const handleUpdateFuelLog = (id: string, updatedLog: FuelLog) => {
    setFuelItems(prev => 
      prev.map(log => log.id === id ? updatedLog : log)
    );
    setSelectedFuelLog(null);
    setIsFuelLogDetailModalVisible(false);
  };

  // Service record handlers
  const handleServiceRecordPress = (record: ServiceRecord) => {
    setSelectedServiceRecord(record);
    setIsServiceHistoryDetailModalVisible(true);
  };

  const handleDeleteServiceRecord = (id: string) => {
    setHistoryItems(prev => prev.filter(record => record.id !== id));
  };

  const handleUpdateServiceRecord = (id: string, updatedRecord: ServiceRecord) => {
    setHistoryItems(prev => 
      prev.map(record => record.id === id ? updatedRecord : record)
    );
    setSelectedServiceRecord(null);
    setIsServiceHistoryDetailModalVisible(false);
  };

  // Maintenance handlers
  const handleMaintenanceItemPress = (item: MaintenanceItem) => {
    setSelectedMaintenanceItem(item);
    setIsMaintenanceDetailModalVisible(true);
  };

  const handleDeleteMaintenanceItem = (id: string) => {
    setMaintenanceItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateMaintenanceItem = (id: string, updatedItem: MaintenanceItem) => {
    setMaintenanceItems(prev => 
      prev.map(item => item.id === id ? updatedItem : item)
    );
    setSelectedMaintenanceItem(null);
    setIsMaintenanceDetailModalVisible(false);
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
                <Text style={styles.licenseText}>{licensePlate}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} onPress={() => setIsUpdateModalVisible(true)}>
              <Edit3 size={24} color={Colors.primary} strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.vehicleBody}>
            <View style={styles.odometerInfo}>
              <Text style={styles.odometerLabel}>CURRENT ODOMETER</Text>
              <Text style={styles.odometerValue}>{mileage}</Text>
            </View>
            <View style={[styles.carImagePlaceholder, imageUrl ? styles.carImageFilled : null]}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.carImage} resizeMode="cover" />
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
        onSave={(newRecord: MaintenanceRecordInput) => {
          const newItem = {
            ...newRecord,
            id: String(Date.now()),
            icon: <Wrench size={22} color={Colors.primary} strokeWidth={2} />,
          };
          setMaintenanceItems((prev) => [newItem, ...prev]);
        }}
      />

      <AddHistoryModal
        visible={isAddHistoryModalVisible}
        onClose={() => setIsAddHistoryModalVisible(false)}
        onSave={(newRecord: ServiceRecordInput) => {
          const newItem = {
            ...newRecord,
            id: String(Date.now()),
            vehicleId: 'v1',
            currency: newRecord.currency || 'AZN', // Ensure currency is included
          };
          setHistoryItems((prev) => [newItem, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }}
      />

      <AddFuelLogModal
        visible={isAddFuelLogModalVisible}
        onClose={() => setIsAddFuelLogModalVisible(false)}
        onSave={(newRecord: FuelLogInput) => {
          // Convert FuelLogInput to FuelLog type
          const newItem: FuelLog = {
            id: String(Date.now()),
            vehicleId: 'v1',
            date: newRecord.date || new Date().toISOString().split('T')[0], // Use provided date or today
            liters: newRecord.fuelUnit === 'liters' ? newRecord.fuelAmount : newRecord.fuelAmount * 3.78541, // Convert gallons to liters
            costPerLiter: newRecord.pricePerUnit || 0,
            totalCost: newRecord.totalCost,
            mileageAtFill: 0, // Odometer removed, use 0 as placeholder
            station: newRecord.stationName,
          };
          setFuelItems((prev) => [newItem, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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
