import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingSlide } from '@/components/OnboardingSlide';
import { PrimaryButton } from '@/components/PrimaryButton';
import { DiagnoseIllustration } from '@/components/illustrations/DiagnoseIllustration';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface Props {
  navigation: any;
}

export const OnboardingDiagnoseScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.navigate('Auth')}
        style={styles.skipTopButton}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <OnboardingSlide
        title="Diagnose Any Problem"
        description="Chat with our AI mechanic to identify car issues and understand what's likely wrong."
        illustration={<DiagnoseIllustration />}
        currentStep={1}
        totalSteps={3}
      />

      <View style={styles.bottomSection}>
        <PrimaryButton
          title="Next"
          onPress={() => navigation.navigate('OnboardingShops')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipTopButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.sm,
  },
  skipText: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    fontWeight: Typography.weightMedium,
  },
  bottomSection: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
});
