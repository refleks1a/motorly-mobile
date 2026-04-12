import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Edit2, Check, X } from 'lucide-react-native';
import { SettingsSection } from './components/SettingsSection';
import { SettingsItem } from './components/SettingsItem';
import { Colors, Typography, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  navigation: any;
}

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { logout, user: authUser, updateProfile } = useAuth();
  
  // State for notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    maintenanceReminders: true,
    serviceAlerts: true,
    promotionalOffers: false,
    diagnosticAlerts: true,
  });

  // Derived display values
  const displayName = authUser 
    ? `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || 'User'
    : 'User';
  const displayEmail = authUser?.email || 'user@example.com';

  // State for name editing
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // State for units & measurements
  const [units, setUnits] = useState({
    distance: 'km' as 'km' | 'miles',
    fuel: 'liters' as 'liters' | 'gallons',
    temperature: 'celsius' as 'celsius' | 'fahrenheit',
    currency: 'AZN' as 'AZN' | 'USD' | 'EUR',
  });

  // State for appearance
  const [appearance, setAppearance] = useState({
    theme: 'light' as 'light' | 'dark' | 'auto',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
  });

  // State for privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    dataCollection: true,
    analytics: true,
    thirdPartySharing: false,
  });

  // Handler for notification toggles
  const handleNotificationToggle = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handler for name editing
  const handleStartEditName = () => {
    setEditedName(displayName);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmedName = editedName.trim();
    if (!trimmedName) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }
    
    const parts = trimmedName.split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');
    
    try {
      await updateProfile({ firstName, lastName });
      setIsEditingName(false);
      Alert.alert('Success', 'Name updated successfully');
    } catch (error) {
      console.error('Failed to update name:', error);
      Alert.alert('Error', 'Failed to update name. Please try again.');
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName('');
  };

  // Handler for privacy toggles
  const handlePrivacyToggle = (key: keyof typeof privacySettings) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Handler for log out
  const handleLogOut = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Navigate to Auth screen and reset navigation stack
              navigation.reset({
                index: 0,
                routes: [{ name: 'Auth' }],
              });
            } catch (error) {
              console.error('Logout failed:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          },
        },
      ]
    );
  };

  // Handler for delete account
  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            // In a real app, this would call API to delete account
            Alert.alert('Account Deleted', 'Your account has been deleted.');
          },
        },
      ]
    );
  };

  // Navigation handlers
  const handleChangePassword = () => {
    // In a real app, this would navigate to ChangePasswordScreen
    // For now, we'll show an alert since navigation setup is needed
    Alert.alert(
      'Change Password',
      'This would navigate to the Change Password screen. In a real implementation, you would use navigation.navigate("ChangePassword").',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  const handleEmailPreferences = () => {
    // In a real app, this would navigate to EmailPreferencesScreen
    // For now, we'll show an alert since navigation setup is needed
    Alert.alert(
      'Email Preferences',
      'This would navigate to the Email Preferences screen. In a real implementation, you would use navigation.navigate("EmailPreferences").',
      [
        { text: 'OK', style: 'default' }
      ]
    );
  };

  // Placeholder handlers for selection screens
  const handleUnitsSelection = () => {
    Alert.alert('Units & Measurements', 'This feature is coming soon.');
  };

  const handleAppearanceSelection = () => {
    Alert.alert('Appearance', 'This feature is coming soon.');
  };

  const handlePrivacySelection = () => {
    Alert.alert('Privacy Settings', 'This feature is coming soon.');
  };

  // Helper function to get display values
  const getUnitDisplayValue = (unit: string, value: string) => {
    const displayMap: Record<string, Record<string, string>> = {
      distance: { km: 'Kilometers', miles: 'Miles' },
      fuel: { liters: 'Liters', gallons: 'Gallons' },
      temperature: { celsius: '°C', fahrenheit: '°F' },
      currency: { AZN: 'AZN', USD: 'USD', EUR: 'EUR' },
    };
    return displayMap[unit]?.[value] || value;
  };

  const getAppearanceDisplayValue = (type: string, value: string) => {
    const displayMap: Record<string, Record<string, string>> = {
      theme: { light: 'Light', dark: 'Dark', auto: 'Auto' },
      fontSize: { small: 'Small', medium: 'Medium', large: 'Large' },
    };
    return displayMap[type]?.[value] || value;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Account Section */}
        <SettingsSection title="Account">
          {/* Profile Display */}
          <View style={styles.profileContainer}>
            <View style={styles.profileIcon}>
              <User size={24} color={Colors.primary} strokeWidth={2} />
            </View>
            <View style={styles.profileInfo}>
              {isEditingName ? (
                <View style={styles.nameEditContainer}>
                  <TextInput
                    style={styles.nameInput}
                    value={editedName}
                    onChangeText={setEditedName}
                    autoFocus
                    placeholder="Enter your name"
                    placeholderTextColor={Colors.outlineVariant}
                  />
                  <View style={styles.editButtons}>
                    <TouchableOpacity
                      onPress={handleSaveName}
                      style={[styles.editButton, styles.saveButton]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Check size={18} color={Colors.onPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={handleCancelEditName}
                      style={[styles.editButton, styles.cancelButton]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <X size={18} color={Colors.onSurface} />
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.nameDisplayContainer}>
                  <Text style={styles.profileName}>{displayName}</Text>
                  <TouchableOpacity
                    onPress={handleStartEditName}
                    style={styles.editIconButton}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Edit2 size={18} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              <Text style={styles.profileEmail}>{displayEmail}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <SettingsItem
            title="Change Password"
            onPress={handleChangePassword}
            type="normal"
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Email Preferences"
            subtitle="Manage notification emails"
            onPress={handleEmailPreferences}
            type="normal"
          />
        </SettingsSection>

        {/* Subscription Section */}
        <SettingsSection title="Subscription">
          <SettingsItem
            title="Manage Subscription"
            subtitle="Free plan · Upgrade for more features"
            onPress={() => navigation.navigate('Subscription')}
            type="normal"
          />
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsItem
            title="Maintenance Reminders"
            subtitle="Get notified about upcoming maintenance"
            type="toggle"
            value={notificationSettings.maintenanceReminders}
            onValueChange={() => handleNotificationToggle('maintenanceReminders')}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Service Due Alerts"
            subtitle="Alerts when service is due"
            type="toggle"
            value={notificationSettings.serviceAlerts}
            onValueChange={() => handleNotificationToggle('serviceAlerts')}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Promotional Offers"
            subtitle="Special offers from partners"
            type="toggle"
            value={notificationSettings.promotionalOffers}
            onValueChange={() => handleNotificationToggle('promotionalOffers')}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Diagnostic Alerts"
            subtitle="AI diagnosis updates"
            type="toggle"
            value={notificationSettings.diagnosticAlerts}
            onValueChange={() => handleNotificationToggle('diagnosticAlerts')}
          />
        </SettingsSection>

        {/* Units & Measurements Section */}
        <SettingsSection title="Units & Measurements">
          <SettingsItem
            title="Distance"
            subtitle="Default unit for distance measurements"
            type="selection"
            onPress={handleUnitsSelection}
            selectedValue={getUnitDisplayValue('distance', units.distance)}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Fuel"
            subtitle="Default unit for fuel measurements"
            type="selection"
            onPress={handleUnitsSelection}
            selectedValue={getUnitDisplayValue('fuel', units.fuel)}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Temperature"
            subtitle="Default unit for temperature"
            type="selection"
            onPress={handleUnitsSelection}
            selectedValue={getUnitDisplayValue('temperature', units.temperature)}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Currency"
            subtitle="Default currency for costs"
            type="selection"
            onPress={handleUnitsSelection}
            selectedValue={getUnitDisplayValue('currency', units.currency)}
          />
        </SettingsSection>

        {/* Appearance Section */}
        <SettingsSection title="Appearance">
          <SettingsItem
            title="Theme"
            subtitle="App color theme"
            type="selection"
            onPress={handleAppearanceSelection}
            selectedValue={getAppearanceDisplayValue('theme', appearance.theme)}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Font Size"
            subtitle="Text size throughout the app"
            type="selection"
            onPress={handleAppearanceSelection}
            selectedValue={getAppearanceDisplayValue('fontSize', appearance.fontSize)}
          />
        </SettingsSection>

        {/* Privacy Section */}
        <SettingsSection title="Privacy">
          <SettingsItem
            title="Data Collection"
            subtitle="Allow anonymous usage data collection"
            type="toggle"
            value={privacySettings.dataCollection}
            onValueChange={() => handlePrivacyToggle('dataCollection')}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Analytics"
            subtitle="Help improve Motorly with analytics"
            type="toggle"
            value={privacySettings.analytics}
            onValueChange={() => handlePrivacyToggle('analytics')}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Third-party Sharing"
            subtitle="Share data with trusted partners"
            type="toggle"
            value={privacySettings.thirdPartySharing}
            onValueChange={() => handlePrivacyToggle('thirdPartySharing')}
          />
        </SettingsSection>

        {/* Actions Section */}
        <SettingsSection title="Actions">
          <SettingsItem
            title="Log Out"
            type="normal"
            onPress={handleLogOut}
          />

          <View style={styles.separator} />

          <SettingsItem
            title="Delete Account"
            subtitle="Permanently delete your account and data"
            type="destructive"
            onPress={handleDeleteAccount}
          />
        </SettingsSection>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Motorly v1.0.0</Text>
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
    paddingHorizontal: Spacing.xxl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: Typography.headlineLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    minHeight: 80,
  },
  profileIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surfaceContainerLow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.lg,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.titleLg,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.surfaceContainerHigh,
    marginHorizontal: Spacing.lg,
  },
  versionContainer: {
    alignItems: 'center',
    marginTop: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  versionText: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  // Name editing styles
  nameEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  nameInput: {
    flex: 1,
    fontSize: Typography.titleLg,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  editButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.surfaceContainerHigh,
  },
  nameDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  editIconButton: {
    marginLeft: Spacing.sm,
    padding: 4,
  },
});
