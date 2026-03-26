import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

interface OnboardingSlideProps {
  title: string;
  description: string;
  illustration: React.ReactNode;
  currentStep: number;
  totalSteps: number;
}

export const OnboardingSlide: React.FC<OnboardingSlideProps> = ({
  title,
  description,
  illustration,
  currentStep,
  totalSteps,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.illustrationContainer}>{illustration}</View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.pagination}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === currentStep ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xxl,
  },
  illustrationContainer: {
    width: width * 0.7,
    height: width * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  title: {
    fontSize: Typography.headlineLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 38,
  },
  description: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    fontWeight: Typography.weightRegular,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.huge,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 28,
    backgroundColor: Colors.primary,
  },
  dotInactive: {
    width: 8,
    backgroundColor: Colors.outlineVariant,
  },
});
