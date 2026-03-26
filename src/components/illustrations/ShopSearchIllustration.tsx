import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Circle, G, Text as SvgText, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors } from '@/constants/theme';

const size = Dimensions.get('window').width * 0.65;

export const ShopSearchIllustration: React.FC = () => {
  return (
    <View style={styles.container}>
      <Svg width={size} height={size * 0.9} viewBox={`0 0 ${size} ${size * 0.9}`}>
        {/* Map background hint */}
        <Rect
          x={size * 0.1}
          y={0}
          width={size * 0.8}
          height={size * 0.45}
          rx={16}
          ry={16}
          fill={Colors.surfaceContainerLow}
        />

        {/* Map pin */}
        <Defs>
          <LinearGradient id="pinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={Colors.primary} />
            <Stop offset="100%" stopColor={Colors.primaryContainer} />
          </LinearGradient>
        </Defs>

        {/* Pin shape */}
        <Circle cx={size * 0.5} cy={size * 0.17} r={16} fill="url(#pinGrad)" />
        <Path
          d={`M ${size * 0.5 - 10} ${size * 0.23} L ${size * 0.5} ${size * 0.3} L ${size * 0.5 + 10} ${size * 0.23}`}
          fill="url(#pinGrad)"
        />
        <Circle cx={size * 0.5} cy={size * 0.17} r={6} fill="white" />

        {/* Verified badge */}
        <Circle cx={size * 0.73} cy={size * 0.08} r={14} fill="#fce8e0" />
        <SvgText
          x={size * 0.73}
          y={size * 0.1}
          fontSize={14}
          textAnchor="middle"
        >
          ✅
        </SvgText>

        {/* Shop card */}
        <Rect
          x={size * 0.12}
          y={size * 0.38}
          width={size * 0.76}
          height={size * 0.45}
          rx={14}
          ry={14}
          fill={Colors.surface}
        />

        {/* Wrench icon circle */}
        <Circle cx={size * 0.24} cy={size * 0.5} r={16} fill={Colors.surfaceContainerLow} />
        <SvgText
          x={size * 0.24}
          y={size * 0.52}
          fontSize={14}
          textAnchor="middle"
          fill={Colors.primary}
        >
          🔧
        </SvgText>

        {/* Star + rating */}
        <SvgText
          x={size * 0.6}
          y={size * 0.47}
          fontSize={10}
          fill={Colors.onSurfaceVariant}
          fontWeight="600"
        >
          ⭐ 4.9 (128)
        </SvgText>

        {/* Shop name */}
        <SvgText
          x={size * 0.24}
          y={size * 0.59}
          fontSize={14}
          fontWeight="700"
          fill={Colors.onBackground}
        >
          Elite Auto Garage
        </SvgText>

        {/* Specialty */}
        <SvgText
          x={size * 0.24}
          y={size * 0.65}
          fontSize={10}
          fill={Colors.onSurfaceVariant}
        >
          Transmission & Engine
        </SvgText>

        {/* Price */}
        <SvgText
          x={size * 0.24}
          y={size * 0.75}
          fontSize={9}
          fill={Colors.onSurfaceVariant}
          letterSpacing={1}
        >
          STARTS AT
        </SvgText>
        <SvgText
          x={size * 0.24}
          y={size * 0.81}
          fontSize={16}
          fontWeight="700"
          fill={Colors.primaryContainer}
        >
          $89.00
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
