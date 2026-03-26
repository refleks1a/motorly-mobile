import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '@/constants/theme';

export const SettingsScreen: React.FC = () => (
  <SafeAreaView style={styles.container}>
    <View style={styles.center}>
      <Text style={styles.label}>Settings</Text>
      <Text style={styles.sub}>Coming soon</Text>
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: Typography.titleLg, fontWeight: Typography.weightBold, color: Colors.onBackground },
  sub: { fontSize: Typography.bodyMd, color: Colors.onSurfaceVariant, marginTop: Spacing.sm },
});
