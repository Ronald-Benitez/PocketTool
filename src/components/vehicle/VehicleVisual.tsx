import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import {
  resolveVehicleColor,
  shadeVehicleColor,
} from '@/src/domain/vehicle/colors';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type VehicleVisualProps = {
  type?: string | null;
  color?: string | null;
  height?: number;
  accessibilityLabel?: string;
};

const WHEEL = 14;

const Wheels = ({
  positions,
  color,
  hub,
}: {
  positions: { x: number; y: number }[];
  color: string;
  hub: string;
}) => (
  <G>
    {positions.map((position) => (
      <G key={`${position.x}-${position.y}`}>
        <Circle
          cx={position.x}
          cy={position.y}
          r={WHEEL}
          fill={color}
        />
        <Circle
          cx={position.x}
          cy={position.y}
          r={WHEEL * 0.52}
          fill={hub}
        />
      </G>
    ))}
  </G>
);

const CarShape = ({
  body,
  dark,
  window,
  wheel,
  hub,
  accent,
}: {
  body: string;
  dark: string;
  window: string;
  wheel: string;
  hub: string;
  accent: string;
}) => (
  <G>
    <Path
      d="M18 76 Q18 58 38 52 L64 34 Q72 27 86 27 L140 27 Q155 27 164 38 L184 52 Q202 56 202 74 L202 80 Q202 86 196 86 L24 86 Q18 86 18 80 Z"
      fill={body}
    />
    <Path
      d="M72 35 L88 29 L136 29 L154 40 L160 51 L66 51 Z"
      fill={window}
      opacity={0.9}
    />
    <Path d="M112 29 L112 51 M66 51 L160 51" stroke={dark} strokeWidth={3} />
    <Rect x={188} y={62} width={10} height={7} rx={3} fill={accent} />
    <Wheels
      positions={[
        { x: 58, y: 86 },
        { x: 162, y: 86 },
      ]}
      color={wheel}
      hub={hub}
    />
  </G>
);

const SuvShape = ({
  body,
  dark,
  window,
  wheel,
  hub,
  accent,
}: {
  body: string;
  dark: string;
  window: string;
  wheel: string;
  hub: string;
  accent: string;
}) => (
  <G>
    <Path
      d="M16 78 Q16 55 36 50 L54 28 Q60 21 72 21 L146 21 Q160 21 168 32 L188 52 Q204 57 204 76 L204 81 Q204 87 198 87 L22 87 Q16 87 16 81 Z"
      fill={body}
    />
    <Path
      d="M62 30 L76 24 L142 24 L158 38 L164 50 L56 50 Z"
      fill={window}
      opacity={0.9}
    />
    <Path d="M108 24 L108 50 M56 50 L164 50" stroke={dark} strokeWidth={3} />
    <Rect x={188} y={64} width={10} height={7} rx={3} fill={accent} />
    <Wheels
      positions={[
        { x: 56, y: 87 },
        { x: 164, y: 87 },
      ]}
      color={wheel}
      hub={hub}
    />
  </G>
);

const PickupShape = ({
  body,
  dark,
  window,
  wheel,
  hub,
  accent,
}: {
  body: string;
  dark: string;
  window: string;
  wheel: string;
  hub: string;
  accent: string;
}) => (
  <G>
    <Path
      d="M16 78 Q16 58 34 52 L54 32 Q61 25 74 25 L122 25 Q136 25 144 36 L158 51 L202 51 L202 84 L202 87 L22 87 Q16 87 16 81 Z"
      fill={body}
    />
    <Path
      d="M62 34 L76 28 L118 28 L136 41 L140 51 L56 51 Z"
      fill={window}
      opacity={0.9}
    />
    <Path d="M102 28 L102 51 M56 51 L140 51" stroke={dark} strokeWidth={3} />
    <Rect x={154} y={63} width={12} height={7} rx={3} fill={accent} />
    <Wheels
      positions={[
        { x: 54, y: 87 },
        { x: 166, y: 87 },
      ]}
      color={wheel}
      hub={hub}
    />
  </G>
);

const VanShape = ({
  body,
  dark,
  window,
  wheel,
  hub,
  accent,
}: {
  body: string;
  dark: string;
  window: string;
  wheel: string;
  hub: string;
  accent: string;
}) => (
  <G>
    <Path
      d="M16 78 Q16 52 36 43 L48 24 Q53 18 63 18 L164 18 Q182 18 190 36 L202 62 L202 82 Q202 87 196 87 L22 87 Q16 87 16 81 Z"
      fill={body}
    />
    <Path
      d="M56 26 L66 22 L122 22 L122 48 L48 48 Z"
      fill={window}
      opacity={0.9}
    />
    <Path
      d="M132 22 L160 22 Q174 22 180 36 L188 48 L132 48 Z"
      fill={window}
      opacity={0.9}
    />
    <Path d="M124 22 L124 48 M48 48 L188 48" stroke={dark} strokeWidth={3} />
    <Rect x={188} y={62} width={10} height={7} rx={3} fill={accent} />
    <Wheels
      positions={[
        { x: 54, y: 87 },
        { x: 166, y: 87 },
      ]}
      color={wheel}
      hub={hub}
    />
  </G>
);

const MotorcycleShape = ({
  body,
  dark,
  seat,
  wheel,
  hub,
  accent,
}: {
  body: string;
  dark: string;
  seat: string;
  wheel: string;
  hub: string;
  accent: string;
}) => (
  <G>
    <Circle cx={54} cy={82} r={20} fill={wheel} />
    <Circle cx={166} cy={82} r={20} fill={wheel} />
    <Circle cx={54} cy={82} r={10} fill={hub} />
    <Circle cx={166} cy={82} r={10} fill={hub} />
    <Path
      d="M54 82 L88 57 L126 57 L166 82 M88 57 L108 82 L126 57"
      stroke={body}
      strokeWidth={8}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M88 57 L76 43 L64 43" stroke={dark} strokeWidth={4} fill="none" strokeLinecap="round" />
    <Path d="M126 57 L142 44 L158 44" stroke={dark} strokeWidth={4} fill="none" strokeLinecap="round" />
    <Rect x={102} y={48} width={34} height={11} rx={5} fill={seat} />
    <Circle cx={158} cy={44} r={4} fill={accent} />
  </G>
);

const GenericShape = ({
  body,
  dark,
  window,
  wheel,
  hub,
  accent,
}: {
  body: string;
  dark: string;
  window: string;
  wheel: string;
  hub: string;
  accent: string;
}) => (
  <CarShape
    body={body}
    dark={dark}
    window={window}
    wheel={wheel}
    hub={hub}
    accent={accent}
  />
);

export const VehicleVisual = ({
  type,
  color,
  height = 120,
  accessibilityLabel,
}: VehicleVisualProps) => {
  const { colors } = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(16);
  const float = useSharedValue(0);

  useEffect(() => {
    opacity.value = 0;
    translateY.value = 16;
    float.value = 0;
    opacity.value = withTiming(1, { duration: 420 });
    translateY.value = withSpring(0, { damping: 13, stiffness: 120 });
    float.value = withRepeat(
      withTiming(-3, { duration: 1700 }),
      -1,
      true
    );
  }, [type, opacity, translateY, float]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value + float.value }],
  }));

  const body = resolveVehicleColor(color);
  const dark = shadeVehicleColor(body, -0.22);
  const window = colors.surface;
  const wheel = colors.text;
  const hub = colors.surfaceMuted;
  const accent = colors.warning;
  const seat = shadeVehicleColor(body, -0.35);

  const shapeProps = {
    body,
    dark,
    window,
    wheel,
    hub,
    accent,
  };

  return (
    <Animated.View style={[styles.wrap, animatedStyle]}>
      <Svg
        viewBox='0 0 220 110'
        width='100%'
        height={height}
        accessible
        accessibilityRole='image'
        accessibilityLabel={accessibilityLabel}
      >
        <Ellipse
          cx={110}
          cy={101}
          rx={82}
          ry={7}
          fill={colors.border}
          opacity={0.35}
        />
        {type === 'suv' ? (
          <SuvShape {...shapeProps} />
        ) : type === 'pickup' ? (
          <PickupShape {...shapeProps} />
        ) : type === 'van' ? (
          <VanShape {...shapeProps} />
        ) : type === 'motorcycle' ? (
          <MotorcycleShape
            body={body}
            dark={dark}
            seat={seat}
            wheel={wheel}
            hub={hub}
            accent={accent}
          />
        ) : type === 'other' ? (
          <GenericShape {...shapeProps} />
        ) : (
          <CarShape {...shapeProps} />
        )}
      </Svg>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
