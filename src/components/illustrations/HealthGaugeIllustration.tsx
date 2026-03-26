import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Car } from 'lucide-react-native';
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
        <View
          style={[
            styles.iconBadge,
            {
              top: center - 20 - 18,
              left: center - 18,
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: Colors.surfaceContainerLow,
            },
          ]}
        >
          <Car size={18} color={Colors.primary} strokeWidth={2.5} />
        </View>

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
    width: size,
    height: size,
  },
  iconBadge: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
