  import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { OnboardingSlide } from '@/components/OnboardingSlide';
import { PrimaryButton } from '@/components/PrimaryButton';
import { ShopSearchIllustration } from '@/components/illustrations/ShopSearchIllustration';
import { Colors, Spacing } from '@/constants/theme';

interface Props {
  navigation: any;
}

export const OnboardingShopsScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <OnboardingSlide
        title="Find Trusted Shops Nearby"
        description="See nearby mechanics, their specialties, prices, and reviews — all in one place."
        illustration={<ShopSearchIllustration />}
        currentStep={2}
        totalSteps={3}
      />

      <View style={styles.bottomSection}>
        <PrimaryButton
          title="Get Started"
          onPress={() => navigation.navigate('Auth')}
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
  bottomSection: {
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.xxxl,
  },
});
