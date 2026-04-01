import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Fuel, ChevronRight } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';
import type { FuelLog } from '@/types';

interface FuelLogCardProps {
  log: FuelLog;
  onPress?: () => void;
}

export const FuelLogCard: React.FC<FuelLogCardProps> = ({ log, onPress }) => {
  const formattedDate = new Date(log.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Icon badge */}
      <View style={styles.iconBadge}>
        <Fuel size={22} color={Colors.primary} strokeWidth={2} />
      </View>

      {/* Text */}
      <View style={styles.textGroup}>
        <Text style={styles.title}>
          {log.liters.toFixed(1)}L — ₼{log.totalCost.toFixed(2)}
        </Text>
        <Text style={styles.subtitle}>
          {formattedDate}{log.station ? ` · ${log.station}` : ''}
        </Text>
      </View>

      {/* Chevron */}
      <View style={styles.right}>
        <Text style={styles.costPerLiter}>
          ₼{log.costPerLiter.toFixed(2)}/L
        </Text>
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
  costPerLiter: {
    fontSize: Typography.labelMd,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
});
