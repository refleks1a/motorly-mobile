import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

type StatusType = 'scheduled' | 'priority' | 'good';

interface MaintenanceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: StatusType;
  onPress?: () => void;
}

const STATUS_ICON: Record<StatusType, React.ReactNode> = {
  scheduled: <Clock size={20} color="#F59E0B" strokeWidth={2.5} />,
  priority:  <AlertTriangle size={20} color={Colors.error} strokeWidth={2.5} />,
  good:      <CheckCircle2 size={20} color={Colors.success} strokeWidth={2.5} />,
};

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({
  icon,
  title,
  subtitle,
  status,
  onPress,
}) => (
  <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
    {/* Icon badge */}
    <View style={styles.iconBadge}>{icon}</View>

    {/* Text */}
    <View style={styles.textGroup}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>

    {/* Status icon + chevron */}
    <View style={styles.right}>
      {STATUS_ICON[status]}
    </View>
  </TouchableOpacity>
);

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
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
