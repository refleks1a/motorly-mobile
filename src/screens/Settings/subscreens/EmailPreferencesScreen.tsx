import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowLeft, Check } from 'lucide-react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { SettingsItem } from '../components/SettingsItem';
import { SettingsSection } from '../components/SettingsSection';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface Props {
  navigation: any;
}

export const EmailPreferencesScreen: React.FC<Props> = ({ navigation }) => {
  // State for email preferences
  const [emailPreferences, setEmailPreferences] = useState({
    maintenanceReminders: true,
    serviceAlerts: true,
    promotionalOffers: false,
    diagnosticAlerts: true,
    newsletter: true,
    productUpdates: false,
    securityAlerts: true,
  });

  // Handler for email preference toggles
  const handleEmailPreferenceToggle = (key: keyof typeof emailPreferences) => {
    setEmailPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handler for save
  const handleSave = () => {
    // Simulate API call
    Alert.alert(
      'Success',
      'Your email preferences have been saved.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  // Handler for select all
  const handleSelectAll = () => {
    setEmailPreferences({
      maintenanceReminders: true,
      serviceAlerts: true,
      promotionalOffers: true,
      diagnosticAlerts: true,
      newsletter: true,
      productUpdates: true,
      securityAlerts: true,
    });
  };

  // Handler for deselect all
  const handleDeselectAll = () => {
    setEmailPreferences({
      maintenanceReminders: false,
      serviceAlerts: false,
      promotionalOffers: false,
      diagnosticAlerts: false,
      newsletter: false,
      productUpdates: false,
      securityAlerts: false,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={Colors.onBackground} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Email Preferences</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Mail size={24} color={Colors.primary} style={styles.descriptionIcon} />
          <Text style={styles.descriptionText}>
            Choose which emails you'd like to receive from Motorly. You can update your preferences at any time.
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleSelectAll}
            activeOpacity={0.7}
          >
            <Check size={16} color={Colors.primary} />
            <Text style={styles.quickActionText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={handleDeselectAll}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionText}>Deselect All</Text>
          </TouchableOpacity>
        </View>

        {/* Vehicle Related Emails */}
        <SettingsSection title="Vehicle Related">
          <SettingsItem
            title="Maintenance Reminders"
            subtitle="Get notified about upcoming maintenance"
            type="toggle"
            value={emailPreferences.maintenanceReminders}
            onValueChange={() => handleEmailPreferenceToggle('maintenanceReminders')}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Service Due Alerts"
            subtitle="Alerts when service is due"
            type="toggle"
            value={emailPreferences.serviceAlerts}
            onValueChange={() => handleEmailPreferenceToggle('serviceAlerts')}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Diagnostic Alerts"
            subtitle="AI diagnosis updates and insights"
            type="toggle"
            value={emailPreferences.diagnosticAlerts}
            onValueChange={() => handleEmailPreferenceToggle('diagnosticAlerts')}
          />
        </SettingsSection>

        {/* Promotional Emails */}
        <SettingsSection title="Promotional">
          <SettingsItem
            title="Promotional Offers"
            subtitle="Special offers from partners"
            type="toggle"
            value={emailPreferences.promotionalOffers}
            onValueChange={() => handleEmailPreferenceToggle('promotionalOffers')}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Newsletter"
            subtitle="Monthly tips and car care advice"
            type="toggle"
            value={emailPreferences.newsletter}
            onValueChange={() => handleEmailPreferenceToggle('newsletter')}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Product Updates"
            subtitle="New features and app updates"
            type="toggle"
            value={emailPreferences.productUpdates}
            onValueChange={() => handleEmailPreferenceToggle('productUpdates')}
          />
        </SettingsSection>

        {/* Security Emails */}
        <SettingsSection title="Security">
          <SettingsItem
            title="Security Alerts"
            subtitle="Important security notifications"
            type="toggle"
            value={emailPreferences.securityAlerts}
            onValueChange={() => handleEmailPreferenceToggle('securityAlerts')}
          />
        </SettingsSection>

        {/* Email Frequency Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Email Frequency</Text>
          <Text style={styles.infoText}>
            • Maintenance reminders: Sent 1 week before due date{'\n'}
            • Service alerts: Sent when service is due{'\n'}
            • Promotional offers: Up to 2 per month{'\n'}
            • Newsletter: Once per month{'\n'}
            • Security alerts: Immediate when needed
          </Text>
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Save Button */}
        <PrimaryButton
          title="Save Preferences"
          onPress={handleSave}
        />
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
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: Typography.headlineLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
    textAlign: 'center',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  descriptionContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    gap: Spacing.md,
  },
  descriptionIcon: {
    marginTop: 2,
  },
  descriptionText: {
    flex: 1,
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceContainerHigh,
  },
  quickActionText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    fontWeight: Typography.weightMedium,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    marginHorizontal: Spacing.lg,
  },
  infoCard: {
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 12,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  infoTitle: {
    fontSize: Typography.bodyLg,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    lineHeight: 20,
  },
  spacer: {
    flex: 1,
    minHeight: Spacing.xxxl,
  },
});