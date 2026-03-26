import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

type StatusType = 'scheduled' | 'priority' | 'good';

interface MaintenanceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: StatusType;
  onPress?: () => void;
}

const STATUS_CONFIG: Record<StatusType, { label: string; color: string }> = {
  scheduled: { label: 'SCHEDULED', color: '#F59E0B' },
  priority:  { label: 'PRIORITY',  color: Colors.error },
  good:      { label: 'GOOD',      color: Colors.success },
};

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({
  icon,
  title,
  subtitle,
  status,
  onPress,
}) => {
  const cfg = STATUS_CONFIG[status];

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Icon badge */}
      <View style={styles.iconBadge}>{icon}</View>

      {/* Text */}
      <View style={styles.textGroup}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Status + chevron */}
      <View style={styles.right}>
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: cfg.color }]} />
          <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
        <ChevronRight size={18} color={Colors.outlineVariant} strokeWidth={2} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
    backgroundColor: '#fce8e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textGroup: {
    flex: 1,
  },
  title: {
    fontSize: Typography.titleSm,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  right: {
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: Typography.labelMd,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    letterSpacing: 0.5,
  },
});
