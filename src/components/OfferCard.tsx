import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Tag } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

const CARD_WIDTH = Dimensions.get('window').width * 0.72;

interface OfferCardProps {
  badge: string;
  title: string;
  subtitle: string;
  buttonLabel: string;
  backgroundColor: string;
  onPress?: () => void;
}

export const OfferCard: React.FC<OfferCardProps> = ({
  badge,
  title,
  subtitle,
  buttonLabel,
  backgroundColor,
  onPress,
}) => (
  <View style={[styles.card, { backgroundColor }]}>
    {/* Badge row */}
    <View style={styles.badgeRow}>
      <Tag size={14} color={Colors.onBackground} strokeWidth={2} />
      <Text style={styles.badge}>{badge}</Text>
    </View>

    {/* Content */}
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>

    {/* CTA */}
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.85}>
      <Text style={styles.buttonText}>{buttonLabel}</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    marginRight: Spacing.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  badge: {
    fontSize: Typography.labelMd,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: Typography.titleLg,
    fontWeight: Typography.weightExtraBold,
    fontFamily: Typography.fontDisplay,
    color: Colors.onBackground,
    marginBottom: Spacing.xs,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.xl,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: Colors.onPrimary,
    fontSize: Typography.bodyLg,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
  },
});
