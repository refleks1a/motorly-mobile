import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingSlide } from '@/components/OnboardingSlide';
import { PrimaryButton } from '@/components/PrimaryButton';
import { HealthGaugeIllustration } from '@/components/illustrations/HealthGaugeIllustration';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface Props {
  navigation: any;
}

export const OnboardingHealthScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <OnboardingSlide
        title="Know Your Car's Health"
        description="Get a clear overview of your vehicle's overall health and upcoming maintenance tasks."
        illustration={<HealthGaugeIllustration />}
        currentStep={0}
        totalSteps={3}
      />

      <View style={styles.bottomSection}>
        <PrimaryButton
          title="Next"
          onPress={() => navigation.navigate('OnboardingDiagnose')}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('AddCar')}
          style={styles.skipButton}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
    alignItems: 'center',
  },
  skipButton: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    fontWeight: Typography.weightMedium,
  },
});
