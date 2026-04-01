import React from 'react';
import { View, Text, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

interface Props {
  issue: string;
  recommendation: string;
  image?: ImageSourcePropType;
}

export const DiagnosisCard: React.FC<Props> = ({ issue, recommendation, image }) => (
  <View style={styles.card}>
    {image && <Image source={image} style={styles.image} resizeMode="cover" />}
    <View style={styles.text}>
      <Text style={styles.issue}>{issue}</Text>
      <Text style={styles.recommendation}>{recommendation}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceContainerLow,
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginTop: Spacing.md,
    gap: Spacing.md,
    padding: Spacing.md,
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: Radius.sm,
  },
  text: {
    flex: 1,
    paddingVertical: Spacing.xs,
  },
  issue: {
    fontSize: Typography.bodyMd,
    fontWeight: Typography.weightSemiBold,
    fontFamily: Typography.fontBody,
    color: Colors.onBackground,
    marginBottom: 2,
  },
  recommendation: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
});
