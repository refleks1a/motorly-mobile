import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Car } from 'lucide-react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface Props {
  navigation: any;
}

export const AddCarScreen: React.FC<Props> = ({ navigation }) => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');

  const isFormValid = make.trim() && model.trim() && year.trim();

  const handleContinue = () => {
    // TODO: Save car data to state/storage
    navigation.navigate('MainApp');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Car icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Car size={40} color={Colors.primary} strokeWidth={2} />
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Add Your Car</Text>
          <Text style={styles.subtitle}>
            We'll use this to personalize your experience.
          </Text>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Make</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. BMW"
                placeholderTextColor={Colors.outlineVariant}
                value={make}
                onChangeText={setMake}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Model</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. M3 Competition"
                placeholderTextColor={Colors.outlineVariant}
                value={model}
                onChangeText={setModel}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.rowFields}>
              <View style={[styles.fieldGroup, styles.halfField]}>
                <Text style={styles.label}>Year</Text>
                <TextInput
                  style={styles.input}
                  placeholder="2024"
                  placeholderTextColor={Colors.outlineVariant}
                  value={year}
                  onChangeText={setYear}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>

              <View style={[styles.fieldGroup, styles.halfField]}>
                <Text style={styles.label}>Mileage (km)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="12,500"
                  placeholderTextColor={Colors.outlineVariant}
                  value={mileage}
                  onChangeText={setMileage}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Info hint */}
            <View style={styles.hintCard}>
              <Image
            source={require('@/assets/images/info.png')}
            style={styles.hintIcon}
            resizeMode="contain"
          />
              <Text style={styles.hintText}>
                Accurate mileage helps us predict when your next service is due
                and track component health.
              </Text>
            </View>
          </View>

          {/* Spacer */}
          <View style={styles.spacer} />

          {/* Buttons */}
          <PrimaryButton
            title="CONTINUE"
            onPress={handleContinue}
            disabled={!isFormValid}
          />

          <TouchableOpacity
            onPress={handleContinue}
            style={styles.laterButton}
          >
            <Text style={styles.laterText}>I'll do this later</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.xxxl,
    paddingBottom: Spacing.xxxl,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 36,
  },
  title: {
    fontSize: Typography.headlineLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: Spacing.xxxl,
    lineHeight: 22,
  },
  form: {
    gap: Spacing.xl,
  },
  fieldGroup: {
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.labelMd,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    textTransform: 'capitalize',
  },
  input: {
    height: 52,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
  },
  rowFields: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  halfField: {
    flex: 1,
  },
  hintCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.sm,
    alignItems: 'flex-start',
  },
  hintIcon: {
    width: 18,
    height: 18,
    marginTop: 2,
  },
  hintText: {
    flex: 1,
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.xxxl,
  },
  laterButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  laterText: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    fontWeight: Typography.weightMedium,
  },
});
