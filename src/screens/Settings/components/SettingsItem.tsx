import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Colors, Typography, Spacing, Radius } from '@/constants/theme';

export type SettingsItemType = 'normal' | 'toggle' | 'destructive' | 'selection';

interface SettingsItemProps {
  title: string;
  subtitle?: string;
  type?: SettingsItemType;
  value?: boolean | string;
  onPress?: () => void;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
  selectedValue?: string;
}

export const SettingsItem: React.FC<SettingsItemProps> = ({
  title,
  subtitle,
  type = 'normal',
  value = false,
  onPress,
  onValueChange,
  disabled = false,
  selectedValue,
}) => {
  const isToggle = type === 'toggle';
  const isDestructive = type === 'destructive';
  const isSelection = type === 'selection';
  const isPressable = !isToggle && !disabled && onPress;

  const handlePress = () => {
    if (isPressable) {
      onPress?.();
    }
  };

  const textColor = isDestructive ? Colors.error : Colors.onBackground;
  const subtitleColor = isDestructive ? Colors.error : Colors.onSurfaceVariant;

  const content = (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, { color: subtitleColor }]}>
            {subtitle}
          </Text>
        )}
        {isSelection && selectedValue && (
          <Text style={styles.selectedValue}>{selectedValue}</Text>
        )}
      </View>

      {isToggle ? (
        <Switch
          value={value as boolean}
          onValueChange={onValueChange}
          trackColor={{ false: Colors.surfaceContainerHigh, true: Colors.primary }}
          thumbColor={Colors.surface}
          ios_backgroundColor={Colors.surfaceContainerHigh}
          disabled={disabled}
        />
      ) : (type === 'normal' || type === 'selection') ? (
        <ChevronRight size={20} color={Colors.outlineVariant} strokeWidth={2} />
      ) : null}
    </View>
  );

  if (isPressable) {
    return (
      <TouchableOpacity
        style={[styles.touchable, disabled && styles.disabled]}
        onPress={handlePress}
        activeOpacity={0.7}
        disabled={disabled}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.wrapper, disabled && styles.disabled]}>{content}</View>;
};

const styles = StyleSheet.create({
  touchable: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  wrapper: {
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    minHeight: 64,
  },
  textContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  title: {
    fontSize: Typography.bodyLg,
    fontFamily: Typography.fontBody,
    fontWeight: Typography.weightMedium,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.onSurfaceVariant,
  },
  selectedValue: {
    fontSize: Typography.bodyMd,
    fontFamily: Typography.fontBody,
    color: Colors.primary,
    fontWeight: Typography.weightMedium,
    marginTop: 2,
  },
  disabled: {
    opacity: 0.5,
  },
});
