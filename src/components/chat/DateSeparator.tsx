import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface Props {
  label: string;
}

export const DateSeparator: React.FC<Props> = ({ label }) => (
  <View style={styles.row}>
    <View style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  chip: {
    backgroundColor: Colors.surfaceContainerHigh,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: 99,
  },
  text: {
    fontSize: Typography.labelMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
});
