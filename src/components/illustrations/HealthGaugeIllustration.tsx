import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path, Text as SvgText, G, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Colors, Typography } from '@/constants/theme';

const size = Dimensions.get('window').width * 0.6;

export const HealthGaugeIllustration: React.FC = () => {
  const center = size / 2;
  const radius = size / 2 - 20;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const progress = 0.85;
  const startAngle = 135;
  const sweepAngle = 270;
  const progressLength = (sweepAngle / 360) * circumference * progress;
  const totalLength = (sweepAngle / 360) * circumference;

  const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (cx: number, cy: number, r: number, startDeg: number, endDeg: number) => {
    const start = polarToCartesian(cx, cy, r, endDeg);
    const end = polarToCartesian(cx, cy, r, startDeg);
    const largeArcFlag = endDeg - startDeg <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  const bgPath = describeArc(center, center, radius, startAngle, startAngle + sweepAngle);
  const fgPath = describeArc(center, center, radius, startAngle, startAngle + sweepAngle * progress);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={Colors.primary} />
            <Stop offset="100%" stopColor={Colors.primaryContainer} />
          </LinearGradient>
        </Defs>

        {/* Background arc */}
        <Path
          d={bgPath}
          stroke={Colors.surfaceContainerLow}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Progress arc */}
        <Path
          d={fgPath}
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
        />

        {/* Car icon placeholder */}
        <Circle cx={center} cy={center - 20} r={18} fill={Colors.surfaceContainerLow} />
        <SvgText
          x={center}
          y={center - 14}
          fontSize={18}
          fill={Colors.primary}
          textAnchor="middle"
        >
          🚗
        </SvgText>

        {/* Percentage text */}
        <SvgText
          x={center}
          y={center + 20}
          fontSize={42}
          fontWeight="800"
          fill={Colors.onBackground}
          textAnchor="middle"
        >
          85
        </SvgText>
        <SvgText
          x={center + 30}
          y={center + 10}
          fontSize={18}
          fontWeight="600"
          fill={Colors.onSurfaceVariant}
          textAnchor="middle"
        >
          %
        </SvgText>
        <SvgText
          x={center}
          y={center + 42}
          fontSize={12}
          fontWeight="600"
          fill={Colors.onSurfaceVariant}
          textAnchor="middle"
          letterSpacing={3}
        >
          HEALTHY
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
