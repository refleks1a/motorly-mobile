import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Circle, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
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

        {/* Robot icon circle */}
        <Circle
          cx={size * 0.5}
          cy={size * 0.25}
          r={24}
          fill="#fce8e0"
        />
        <SvgText
          x={size * 0.5}
          y={size * 0.27}
          fontSize={22}
          textAnchor="middle"
          fill={Colors.primary}
        >
          🤖
        </SvgText>

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
        <Circle
          cx={size * 0.82}
          cy={size * 0.15}
          r={18}
          fill={Colors.surface}
        />
        <SvgText
          x={size * 0.82}
          y={size * 0.17}
          fontSize={16}
          textAnchor="middle"
          fill="#0077b6"
        >
          🔬
        </SvgText>

        {/* Floating wrench icon */}
        <Circle
          cx={size * 0.12}
          cy={size * 0.62}
          r={18}
          fill="#fce8e0"
        />
        <SvgText
          x={size * 0.12}
          y={size * 0.64}
          fontSize={16}
          textAnchor="middle"
          fill={Colors.primaryContainer}
        >
          🔧
        </SvgText>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
