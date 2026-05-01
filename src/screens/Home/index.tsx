import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Car, Droplets, Disc, Wrench } from 'lucide-react-native';
import { SectionHeader } from '@/components/SectionHeader';
import { MaintenanceCard } from '@/components/MaintenanceCard';
import { OfferCard } from '@/components/OfferCard';
import { OfferDetailModal, type OfferDetail } from '@/components/OfferDetailModal';
import { NewsCard } from '@/components/NewsCard';
import { MaintenanceDetailModal, type MaintenanceItem } from '@/components/MaintenanceDetailModal';
import { Colors, Typography, Spacing, Radius, Elevation } from '@/constants/theme';
import { useVehicles } from '@/contexts/VehicleContext';
import vehicleService from '@/services/vehicle.service';
import newsService, { NewsItem as NewsItemType } from '@/services/news.service';

const MOCK_OFFERS: OfferDetail[] = [
  {
    id: '1',
    badge: 'LIMITED TIME',
    title: '20% Off Brake Service',
    subtitle: 'At City Center Motors',
    buttonLabel: 'Claim Offer',
    backgroundColor: '#ffdccf',
    // Detailed fields
    description: 'Get 20% off on all brake services including pad replacement, rotor resurfacing, and brake fluid flush. Professional service with 12-month warranty.',
    validUntil: '2026-04-30',
    shopName: 'City Center Motors',
    shopLocation: '123 Main Street, Baku, Azerbaijan',
    shopPhone: '+994 12 345 67 89',
    shopInstagram: '@citycentermotors',
    shopFacebook: 'City Center Motors Baku',
    terms: 'Valid for first-time customers only. Cannot be combined with other offers. Appointment required. Offer valid until April 30, 2026.',
  },
  {
    id: '2',
    badge: 'FREE CHECK',
    title: 'Free Engine Health Scan',
    subtitle: 'Keep your engine happy',
    buttonLabel: 'Book Now',
    backgroundColor: '#cce8ff',
    // Detailed fields
    description: 'Comprehensive engine diagnostic scan using state-of-the-art equipment. Includes battery test, emission check, and performance analysis.',
    validUntil: '2026-03-31',
    shopName: 'AutoCare Pro',
    shopLocation: '45 Nizami Street, Baku, Azerbaijan',
    shopPhone: '+994 12 987 65 43',
    shopInstagram: '@autocarepro',
    shopFacebook: 'AutoCare Pro Azerbaijan',
    terms: 'Free scan includes basic diagnostics. Additional repairs quoted separately. One free scan per vehicle. Valid until March 31, 2026.',
  },
];

interface Props {
  navigation: any;
}

export const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const { primaryVehicle, isLoading, refreshVehicles } = useVehicles();
  
  // Refresh vehicles and maintenance items when navigating back to home
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshVehicles();
      // Also refresh maintenance items when coming back from MyCar page
      if (primaryVehicle?.id) {
        fetchMaintenanceItems();
      }
    });
    
    return unsubscribe;
  }, [navigation, refreshVehicles, primaryVehicle?.id]);

  // Display name and mileage from vehicle data or show placeholder
  const vehicleDisplayName = primaryVehicle
    ? `${primaryVehicle.year} ${primaryVehicle.make} ${primaryVehicle.model}`
    : 'No Vehicle Added';
  const vehicleMileage = primaryVehicle
    ? `${primaryVehicle.mileage?.toLocaleString() || 0} km`
    : '0 km';
  const healthScore = primaryVehicle?.healthScore ?? 100;
  const healthFraction = healthScore / 100;

  // ── Automotive News state ──
  const [news, setNews] = useState<NewsItemType[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      setIsLoadingNews(true);
      const articles = await newsService.getAutomotiveNews(10);
      setNews(articles);
    } catch (error) {
      console.error('[HomeScreen] Failed to fetch news:', error);
      // Keep previous news if already loaded; silently fail on refresh
    } finally {
      setIsLoadingNews(false);
    }
  }, []);

  // Fetch news on mount
  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  // State for offer detail modal
  const [selectedOffer, setSelectedOffer] = useState<OfferDetail | null>(null);
  const [isOfferModalVisible, setIsOfferModalVisible] = useState(false);

  // State for maintenance items and loading
  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>([]);
  const [isLoadingMaintenance, setIsLoadingMaintenance] = useState(true);

  // State for maintenance detail modal
  const [selectedMaintenanceItem, setSelectedMaintenanceItem] = useState<MaintenanceItem | null>(null);
  const [isMaintenanceDetailModalVisible, setIsMaintenanceDetailModalVisible] = useState(false);

  // Function to fetch maintenance items (extracted for reuse)
  const fetchMaintenanceItems = async () => {
    if (!primaryVehicle?.id) {
      setMaintenanceItems([]);
      setIsLoadingMaintenance(false);
      return;
    }

    try {
      setIsLoadingMaintenance(true);
      const items = await vehicleService.getMaintenanceItems(primaryVehicle.id);
      
      // Convert API items to UI format (show only upcoming/priority items)
      const uiItems: MaintenanceItem[] = items
        .filter(item => item.status === 'overdue' || item.status === 'due_soon' || item.status === 'scheduled')
        .map(item => ({
          id: item.id,
          title: item.name,
          subtitle: item.notes || item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('_', ' '),
          status: (item.status === 'overdue' || item.status === 'due_soon' ? 'priority' : 'scheduled') as 'scheduled' | 'priority' | 'good',
          icon: <Wrench size={22} color={Colors.primary} strokeWidth={2} />,
        }))
        .slice(0, 2); // Show only first 2 items on home page
      
      setMaintenanceItems(uiItems);
    } catch (error) {
      console.error('Failed to fetch maintenance items:', error);
      setMaintenanceItems([]);
    } finally {
      setIsLoadingMaintenance(false);
    }
  };

  // Fetch maintenance items when primary vehicle changes
  useEffect(() => {
    fetchMaintenanceItems();
  }, [primaryVehicle?.id]);

  // Handler for viewing all maintenance items
  const handleViewAllMaintenance = () => {
    navigation.navigate('MyCar', { 
      initialTab: 0 // 0 = Maintenance tab
    });
  };

  // Handler for maintenance card press
  const handleMaintenancePress = (item: MaintenanceItem) => {
    setSelectedMaintenanceItem(item);
    setIsMaintenanceDetailModalVisible(true);
  };

  // Handler for offer card press
  const handleOfferPress = (offer: OfferDetail) => {
    setSelectedOffer(offer);
    setIsOfferModalVisible(true);
  };

  // Handler for offer button press (same as card press for now)
  const handleOfferButtonPress = (offer: OfferDetail) => {
    handleOfferPress(offer);
  };

  // Handler for closing offer modal
  const handleCloseOfferModal = () => {
    setIsOfferModalVisible(false);
    setSelectedOffer(null);
  };

  // Handler for closing maintenance modal
  const handleCloseMaintenanceModal = () => {
    setIsMaintenanceDetailModalVisible(false);
    setSelectedMaintenanceItem(null);
  };

  // Handler for claiming offer
  const handleClaimOffer = () => {
    if (selectedOffer) {
      // In a real app, this would call an API to claim the offer
      alert(`Offer "${selectedOffer.title}" claimed successfully!`);
      handleCloseOfferModal();
    }
  };

  // Handler for maintenance actions (delete/update)
  const handleDeleteMaintenanceItem = async (id: string) => {
    try {
      if (!primaryVehicle?.id) {
        console.error('Cannot delete maintenance item: No vehicle ID');
        return;
      }
      
      // Call the API to delete the maintenance item
      await vehicleService.deleteMaintenanceItem(primaryVehicle.id, id);
      
      // Remove the deleted item from the local state
      setMaintenanceItems(prev => prev.filter(item => item.id !== id));
      
      console.log('Maintenance item deleted successfully');
      handleCloseMaintenanceModal();
    } catch (error) {
      console.error('Failed to delete maintenance item:', error);
      // Keep the modal open so user can try again
      // In a production app, you might want to show an error message to the user
    }
  };

  const handleUpdateMaintenanceItem = (id: string, updatedItem: MaintenanceItem) => {
    // Update the item in the local state
    setMaintenanceItems(prev => 
      prev.map(item => item.id === id ? updatedItem : item)
    );
    handleCloseMaintenanceModal();
  };

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

        {/* ── Primary Vehicle Card ── */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleTop}>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleLabel}>PRIMARY VEHICLE</Text>
              <Text style={styles.vehicleName}>{vehicleDisplayName}</Text>
              <Text style={styles.vehicleMileage}>{vehicleMileage}</Text>
            </View>
            <View style={styles.carImagePlaceholder}>
              {primaryVehicle?.imageUrl ? (
                <Image 
                  source={{ uri: primaryVehicle.imageUrl }} 
                  style={{ width: '100%', height: '100%' }} 
                  resizeMode="cover" 
                />
              ) : (
                <Car size={32} color={Colors.primary} strokeWidth={2} />
              )}
            </View>
          </View>

          {/* Health bar */}
          <View style={styles.healthSection}>
            <Text style={styles.healthLabel}>Overall Health Score</Text>
            <Text style={styles.healthScore}>{healthScore}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${healthFraction * 100}%` as any }]} />
          </View>
        </View>

        {/* ── Automotive News ── */}
        <View style={styles.section}>
          <SectionHeader title="Automotive News" />
          {isLoadingNews ? (
            <View style={styles.newsLoadingContainer}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.loadingText}>Loading latest news…</Text>
            </View>
          ) : news.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No news available right now.</Text>
              <Text style={styles.emptySubtext}>Pull to refresh or check back later.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.offersScroll}
            >
              {news.map((article) => (
                <NewsCard
                  key={article.id}
                  id={article.id}
                  title={article.title}
                  excerpt={article.excerpt}
                  imageUrl={article.imageUrl}
                  date={article.date}
                  category={article.category}
                  url={article.url}
                  onPress={() => {
                    if (article.url) {
                      Linking.openURL(article.url).catch(() =>
                        console.warn('Could not open URL:', article.url)
                      );
                    }
                  }}
                />
              ))}
            </ScrollView>
          )}
        </View>

        {/* ── Special Offers ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Special Offers"
            // No actionLabel - removed "All" button as requested
          />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.offersScroll}
          >
            {MOCK_OFFERS.map((offer) => (
              <OfferCard
                key={offer.id}
                badge={offer.badge}
                title={offer.title}
                subtitle={offer.subtitle}
                buttonLabel={offer.buttonLabel}
                backgroundColor={offer.backgroundColor}
                onPress={() => handleOfferPress(offer)}
                onButtonPress={() => handleOfferButtonPress(offer)}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Offer Detail Modal */}
      <OfferDetailModal
        visible={isOfferModalVisible}
        onClose={handleCloseOfferModal}
        offer={selectedOffer}
        onClaim={handleClaimOffer}
      />

      {/* Maintenance Detail Modal */}
      <MaintenanceDetailModal
        visible={isMaintenanceDetailModalVisible}
        onClose={handleCloseMaintenanceModal}
        item={selectedMaintenanceItem}
        onDelete={handleDeleteMaintenanceItem}
        onUpdate={handleUpdateMaintenanceItem}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: Spacing.lg,
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

  // Vehicle Card
  vehicleCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.xxl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Elevation.floating,
  },
  vehicleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  vehicleInfo: {
    flex: 1,
    gap: Spacing.xs,
    marginRight: Spacing.md,
  },
  vehicleLabel: {
    fontSize: Typography.labelSm,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  vehicleName: {
    fontSize: Typography.titleLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
  },
  vehicleMileage: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  carImagePlaceholder: {
    width: 140,
    height: 70,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  healthSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  healthLabel: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  healthScore: {
    fontSize: Typography.bodyMd,
    fontWeight: Typography.weightBold,
    fontFamily: Typography.fontBody,
    color: Colors.primary,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceContainerLow,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  // Sections
  section: {
    paddingHorizontal: Spacing.xxl,
    marginBottom: Spacing.xl,
  },
  offersScroll: {
    paddingRight: Spacing.xxl,
    paddingLeft: 0,
  },

  // Loading and empty states
  newsLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  emptySubtext: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.outlineVariant,
    textAlign: 'center',
  },
});
