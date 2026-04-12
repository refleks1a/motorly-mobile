import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, ChevronLeft, Zap, Shield, Crown } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius, Elevation, Button } from '@/constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

type BillingCycle = 'monthly' | 'yearly';
type PlanId = 'free' | 'premium' | 'max';

interface Plan {
  id: PlanId;
  name: string;
  monthlyPrice: string;
  yearlyPrice: string;
  yearlyMonthlyEquiv: string; // "X/mo" shown under yearly price
  description: string;
  perks: string[];
  icon: React.ReactNode;
  highlighted: boolean; // "Most Popular"
}

// ─── Placeholder data — replace with real data before launch ─────────────────

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyPrice: '$0',
    yearlyPrice: '$0',
    yearlyMonthlyEquiv: '$0/mo',
    description: 'Everything you need to get started.',
    perks: [
      '1 conversation per day',
      'Basic maintenance tracking',
      '1 vehicle',
    ],
    icon: <Shield size={22} color={Colors.onSurfaceVariant} strokeWidth={2} />,
    highlighted: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    monthlyPrice: '$3.99',
    yearlyPrice: '$34.99',
    yearlyMonthlyEquiv: '$2.91/mo',
    description: 'For drivers who want more control.',
    perks: [
      '5 conversation per day',
      'Advanced diagnostics',
      'Photo/Receipt Uploads',
      'Up to 3 vehicles',
    ],
    icon: <Zap size={22} color={Colors.primary} strokeWidth={2} />,
    highlighted: true,
  },
  {
    id: 'max',
    name: 'Max',
    monthlyPrice: '$6.99',
    yearlyPrice: '$59.99',
    yearlyMonthlyEquiv: '$4.99/mo',
    description: 'The full Motorly experience.',
    perks: [
      'Unlimited conversations',
      'AI-powered insights',
      'Photo/Receipt Uploads',
      'Unlimited vehicles',
      'VIP Partner Discounts',
      'Priority support',
    ],
    icon: <Crown size={22} color={Colors.primary} strokeWidth={2} />,
    highlighted: false,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  navigation: any;
  route: any;
}

export const SubscriptionScreen: React.FC<Props> = ({ navigation, route }) => {
  // When navigated from sign-up we pass isOnboarding=true so the screen
  // continues the onboarding flow instead of going back.
  const isOnboarding: boolean = route?.params?.isOnboarding ?? false;

  const [billing, setBilling] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('free');

  const handleSubscribe = () => {
    if (selectedPlan !== 'free') {
      // TODO: connect payment processor
      Alert.alert(
        'Coming Soon',
        `Payment processing for the ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)} plan will be available soon.`,
        [{
          text: 'OK',
          onPress: () => isOnboarding ? navigation.navigate('AddCar') : navigation.goBack(),
        }]
      );
      return;
    }
    // Free plan — just continue
    if (isOnboarding) {
      navigation.navigate('AddCar');
    } else {
      navigation.goBack();
    }
  };

  const currentPlan = PLANS.find(p => p.id === selectedPlan)!;
  const ctaLabel =
    selectedPlan === 'free'
      ? isOnboarding ? 'Continue with Free' : 'Keep Free Plan'
      : `Subscribe · ${billing === 'monthly' ? currentPlan.monthlyPrice + '/mo' : currentPlan.yearlyPrice + '/yr'}`;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Navigation bar ── */}
      <View style={styles.navbar}>
        {/* Back button: hidden during onboarding so users must make a choice */}
        {isOnboarding ? (
          <View style={styles.navSpacer} />
        ) : (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronLeft size={24} color={Colors.onBackground} strokeWidth={2} />
          </TouchableOpacity>
        )}
        <Text style={styles.navTitle}>
          {isOnboarding ? 'Welcome to Motorly' : 'Choose a Plan'}
        </Text>
        <View style={styles.navSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero copy ── */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>
            {isOnboarding ? 'Pick your plan' : 'Upgrade Motorly'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {isOnboarding
              ? 'Start with Free and upgrade anytime.'
              : 'Get the most out of your vehicle experience.'}
          </Text>
        </View>

        {/* ── Billing toggle ── */}
        <View style={styles.toggleWrapper}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleOption, billing === 'monthly' && styles.toggleOptionActive]}
              onPress={() => setBilling('monthly')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, billing === 'monthly' && styles.toggleTextActive]}>
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleOption, billing === 'yearly' && styles.toggleOptionActive]}
              onPress={() => setBilling('yearly')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, billing === 'yearly' && styles.toggleTextActive]}>
                Yearly
              </Text>
              <View style={styles.saveBadge}>
                <Text style={styles.saveBadgeText}>Save ~20%</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Plan cards ── */}
        <View style={styles.plansContainer}>
          {PLANS.map(plan => {
            const isSelected = selectedPlan === plan.id;
            const price =
              billing === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
            const sub =
              billing === 'monthly'
                ? plan.id === 'free'
                  ? 'forever free'
                  : 'per month'
                : plan.id === 'free'
                ? 'forever free'
                : `billed annually · ${plan.yearlyMonthlyEquiv}`;

            return (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  isSelected && styles.planCardSelected,
                  plan.highlighted && !isSelected && styles.planCardHighlighted,
                ]}
                onPress={() => setSelectedPlan(plan.id)}
                activeOpacity={0.85}
              >
                {/* Most Popular badge */}
                {plan.highlighted && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                  </View>
                )}

                {/* Card header */}
                <View style={styles.planHeader}>
                  <View style={styles.planIconWrapper}>{plan.icon}</View>
                  <View style={styles.planTitleGroup}>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                  {/* Selection indicator */}
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>

                {/* Price */}
                <View style={styles.priceRow}>
                  <Text style={styles.priceAmount}>{price}</Text>
                  <Text style={styles.priceSub}>{sub}</Text>
                </View>

                {/* Divider */}
                <View style={styles.planDivider} />

                {/* Perks */}
                <View style={styles.perksContainer}>
                  {plan.perks.map((perk, i) => (
                    <View key={i} style={styles.perkRow}>
                      <View style={styles.perkCheckWrapper}>
                        <Check size={13} color={isSelected ? Colors.primary : Colors.onSurfaceVariant} strokeWidth={2.5} />
                      </View>
                      <Text style={[styles.perkText, isSelected && styles.perkTextSelected]}>
                        {perk}
                      </Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Fine print ── */}
        <Text style={styles.finePrint}>
          Cancel anytime. Prices shown in USD. Taxes may apply.
        </Text>
      </ScrollView>

      {/* ── CTA button (sticky at bottom) ── */}
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={[styles.ctaButton, selectedPlan === 'free' && styles.ctaButtonSecondary]}
          onPress={handleSubscribe}
          activeOpacity={0.85}
        >
          <Text style={[styles.ctaText, selectedPlan === 'free' && styles.ctaTextSecondary]}>
            {ctaLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  // Navbar
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  backButton: {
    padding: Spacing.xs,
  },
  navTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.titleMd,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
  },
  navSpacer: {
    width: 32, // mirrors backButton width for centering
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },

  // Hero
  heroSection: {
    marginBottom: Spacing.xl,
    gap: Spacing.xs,
  },
  heroTitle: {
    fontSize: Typography.headlineMd,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
  },
  heroSubtitle: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },

  // Billing toggle
  toggleWrapper: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerHigh,
    borderRadius: Radius.full,
    padding: 4,
  },
  toggleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.full,
    gap: Spacing.xs,
  },
  toggleOptionActive: {
    backgroundColor: Colors.surface,
    ...Elevation.floating,
  },
  toggleText: {
    fontSize: Typography.bodyMd,
    fontWeight: Typography.weightMedium,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  toggleTextActive: {
    color: Colors.onBackground,
    fontWeight: Typography.weightSemiBold,
  },
  saveBadge: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: Typography.weightBold,
    fontFamily: Typography.fontBody,
    color: Colors.onPrimary,
    letterSpacing: 0.3,
  },

  // Plan cards
  plansContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...Elevation.floating,
  },
  planCardSelected: {
    borderColor: Colors.primary,
  },
  planCardHighlighted: {
    borderColor: Colors.outlineVariant,
  },

  // Popular badge
  popularBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
    marginBottom: Spacing.md,
  },
  popularBadgeText: {
    fontSize: 10,
    fontWeight: Typography.weightBold,
    fontFamily: Typography.fontBody,
    color: Colors.onPrimary,
    letterSpacing: 1,
  },

  // Plan header row
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  planIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTitleGroup: {
    flex: 1,
    gap: 2,
  },
  planName: {
    fontSize: Typography.titleMd,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
  },
  planDescription: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },

  // Price
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  priceAmount: {
    fontSize: Typography.headlineMd,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
  },
  priceSub: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },

  // Divider
  planDivider: {
    height: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    marginBottom: Spacing.md,
  },

  // Perks
  perksContainer: {
    gap: Spacing.sm,
  },
  perkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  perkCheckWrapper: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  perkText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    flex: 1,
  },
  perkTextSelected: {
    color: Colors.onBackground,
  },

  // Fine print
  finePrint: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    opacity: 0.7,
  },

  // CTA
  ctaContainer: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceContainerHigh,
  },
  ctaButton: {
    height: Button.height,
    backgroundColor: Colors.primary,
    borderRadius: Button.radiusPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonSecondary: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  ctaText: {
    fontSize: Typography.titleSm,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onPrimary,
  },
  ctaTextSecondary: {
    color: Colors.onSurfaceVariant,
  },
});
