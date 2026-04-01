import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SectionHeader } from '@/components/SectionHeader';
import { Colors, Spacing } from '@/constants/theme';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  children,
  actionLabel,
  onAction,
}) => {
  return (
    <View style={styles.container}>
      <SectionHeader
        title={title}
        actionLabel={actionLabel}
        onAction={onAction}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.xl,
  },
  content: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
  },
});