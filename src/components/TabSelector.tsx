import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '@/constants/theme';

interface TabSelectorProps {
  tabs: string[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export const TabSelector: React.FC<TabSelectorProps> = ({
  tabs,
  activeIndex,
  onTabPress,
}) => (
  <View style={styles.container}>
    {tabs.map((label, index) => {
      const isActive = index === activeIndex;
      return (
        <TouchableOpacity
          key={label}
          style={styles.tab}
          onPress={() => onTabPress(index)}
          activeOpacity={0.7}
          hitSlop={{ top: 6, bottom: 6 }}
        >
          <Text style={[styles.label, isActive && styles.labelActive]}>
            {label}
          </Text>
          <View style={[styles.indicator, isActive && styles.indicatorActive]} />
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: 0,
    paddingHorizontal: Spacing.xxl,
    gap: Spacing.xxl,
  },
  tab: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.bodyLg,
    fontWeight: Typography.weightMedium,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
    marginBottom: Spacing.sm,
  },
  labelActive: {
    fontWeight: Typography.weightSemiBold,
    color: Colors.primary,
  },
  indicator: {
    height: 3,
    width: '100%',
    borderRadius: 2,
    backgroundColor: 'transparent',
  },
  indicatorActive: {
    backgroundColor: Colors.primary,
  },
});
