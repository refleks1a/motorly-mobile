import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Briefcase, Car, Droplets, Disc } from 'lucide-react-native';
import { SectionHeader } from '@/components/SectionHeader';
import { MaintenanceCard } from '@/components/MaintenanceCard';
import { OfferCard } from '@/components/OfferCard';
import { Colors, Typography, Spacing, Radius, Elevation } from '@/constants/theme';

// Mock data — will be replaced by real API data later
const MOCK_VEHICLE = {
  name: '2019 Honda Civic',
  mileage: '45,230 km',
  healthScore: 85,
};

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
];

const MOCK_OFFERS = [
  {
    id: '1',
    badge: 'LIMITED TIME',
    title: '20% Off Brake Service',
    subtitle: 'At City Center Motors',
    buttonLabel: 'Claim Offer',
    backgroundColor: '#ffdccf',
  },
  {
    id: '2',
    badge: 'FREE CHECK',
    title: 'Free Engine Health Scan',
    subtitle: 'Keep your engine happy',
    buttonLabel: 'Book Now',
    backgroundColor: '#cce8ff',
  },
];

export const HomeScreen: React.FC = () => {
  const { name, mileage, healthScore } = MOCK_VEHICLE;
  const healthFraction = healthScore / 100;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Briefcase size={22} color={Colors.primary} strokeWidth={2.5} />
          <Text style={styles.wordmark}>Motorly</Text>
        </View>

        {/* ── Primary Vehicle Card ── */}
        <View style={styles.vehicleCard}>
          <View style={styles.vehicleTop}>
            <View style={styles.vehicleInfo}>
              <Text style={styles.vehicleLabel}>PRIMARY VEHICLE</Text>
              <Text style={styles.vehicleName}>{name}</Text>
              <Text style={styles.vehicleMileage}>{mileage}</Text>
            </View>
            <View style={styles.vehicleIconCircle}>
              <Car size={32} color={Colors.primary} strokeWidth={2} />
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

        {/* ── Upcoming Maintenance ── */}
        <View style={styles.section}>
          <SectionHeader title="Upcoming Maintenance" />
          {MOCK_MAINTENANCE.map((item) => (
            <MaintenanceCard
              key={item.id}
              icon={item.icon}
              title={item.title}
              subtitle={item.subtitle}
              status={item.status}
            />
          ))}
        </View>

        {/* ── Special Offers ── */}
        <View style={styles.section}>
          <SectionHeader
            title="Special Offers"
            actionLabel="View All"
            onAction={() => {}}
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
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  wordmark: {
    fontSize: Typography.titleLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
  },

  // Vehicle Card
  vehicleCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.xxl,
    padding: Spacing.xl,
    marginBottom: Spacing.xxxl,
    ...Elevation.floating,
  },
  vehicleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  vehicleInfo: {
    gap: Spacing.xs,
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
  vehicleIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
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
    marginBottom: Spacing.xxxl,
  },
  offersScroll: {
    paddingRight: Spacing.xxl,
  },
});
