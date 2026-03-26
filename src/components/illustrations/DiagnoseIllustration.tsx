import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Circle, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Bot, Microscope, Wrench } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

const size = Dimensions.get('window').width * 0.65;

export const DiagnoseIllustration: React.FC = () => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Chat card background */}
        <Rect
          x={size * 0.15}
          y={size * 0.1}
          width={size * 0.7}
          height={size * 0.55}
          rx={16}
          ry={16}
          fill={Colors.surface}
        />

        <View
          style={[
            styles.iconBadge,
            {
              top: size * 0.25 - 24,
              left: size * 0.5 - 24,
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: '#fce8e0',
            },
          ]}
        >
          <Bot size={28} color={Colors.primary} strokeWidth={2} />
        </View>

        {/* Placeholder text lines */}
        <Rect
          x={size * 0.28}
          y={size * 0.37}
          width={size * 0.44}
          height={6}
          rx={3}
          fill={Colors.surfaceContainerLow}
        />
        <Rect
          x={size * 0.28}
          y={size * 0.43}
          width={size * 0.32}
          height={6}
          rx={3}
          fill={Colors.surfaceContainerLow}
        />

        {/* Small user chat bubble */}
        <Rect
          x={size * 0.55}
          y={size * 0.52}
          width={size * 0.18}
          height={size * 0.1}
          rx={8}
          fill="#fce8e0"
        />

        {/* Floating diagnostic icon */}
        <View
          style={[
            styles.iconBadge,
            {
              top: size * 0.15 - 18,
              left: size * 0.82 - 18,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: Colors.surface,
              elevation: 4,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
          ]}
        >
          <Microscope size={20} color="#0077b6" strokeWidth={2} />
        </View>

        {/* Floating wrench icon */}
        <View
          style={[
            styles.iconBadge,
            {
              top: size * 0.62 - 18,
              left: size * 0.12 - 18,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: '#fce8e0',
            },
          ]}
        >
          <Wrench size={18} color={Colors.primaryContainer} strokeWidth={2} />
        </View>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
  },
  iconBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
