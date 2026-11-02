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
  normalizeVehicleType,
  type VehicleType,
} from '@/src/domain/vehicle/models';
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
    <Circle cx={52} cy={82} r={17} fill={wheel} />
    <Circle cx={168} cy={82} r={17} fill={wheel} />
    <Circle cx={52} cy={82} r={8} fill={hub} />
    <Circle cx={168} cy={82} r={8} fill={hub} />
    <Path
      d="M52 82 L84 68 L112 68 L136 56 L168 82"
      stroke={body}
      strokeWidth={9}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M84 68 L102 82 L124 82 L136 64"
      stroke={dark}
      strokeWidth={4}
      fill="none"
      strokeLinecap="round"
    />
    <Path d="M136 56 L146 40 L164 40" stroke={dark} strokeWidth={4} fill="none" strokeLinecap="round" />
    <Rect x={92} y={56} width={40} height={12} rx={6} fill={seat} />
    <Path d="M146 40 L152 30" stroke={accent} strokeWidth={4} strokeLinecap='round' />
  </G>
);

const CrossoverShape = ({
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
      d="M16 78 Q16 60 36 55 L54 38 Q60 31 74 31 L142 31 Q156 31 166 42 L184 56 Q202 60 202 76 L202 81 Q202 87 196 87 L22 87 Q16 87 16 81 Z"
      fill={body}
    />
    <Path
      d="M62 40 L76 34 L138 34 L154 45 L160 55 L56 55 Z"
      fill={window}
      opacity={0.9}
    />
    <Path d="M108 34 L108 55 M56 55 L160 55" stroke={dark} strokeWidth={3} />
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

const BusShape = ({
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
    <Rect x={12} y={26} width={196} height={62} rx={10} fill={body} />
    <Rect x={22} y={34} width={48} height={22} rx={3} fill={window} />
    <Rect x={78} y={34} width={48} height={22} rx={3} fill={window} />
    <Rect x={134} y={34} width={48} height={22} rx={3} fill={window} />
    <Path d="M70 26 L70 88 M126 26 L126 88" stroke={dark} strokeWidth={2} />
    <Rect x={190} y={56} width={10} height={8} rx={3} fill={accent} />
    <Wheels
      positions={[
        { x: 54, y: 88 },
        { x: 166, y: 88 },
      ]}
      color={wheel}
      hub={hub}
    />
  </G>
);

const MicrobusShape = ({
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
    <Rect x={50} y={26} width={38} height={22} rx={3} fill={window} />
    <Rect x={94} y={26} width={38} height={22} rx={3} fill={window} />
    <Rect x={138} y={26} width={32} height={22} rx={3} fill={window} />
    <Path d="M70 26 L70 48 M114 26 L114 48 M158 26 L158 48" stroke={dark} strokeWidth={2} />
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

const CamionShape = ({
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
    <Rect x={92} y={34} width={114} height={50} rx={4} fill={body} />
    <Path
      d="M16 80 Q16 58 34 52 L54 36 Q60 30 74 30 L92 30 L92 84 L22 84 Z"
      fill={body}
    />
    <Path d="M62 36 L76 32 L88 32 L88 56 L56 56 Z" fill={window} opacity={0.9} />
    <Path d="M92 46 L92 84" stroke={dark} strokeWidth={3} />
    <Rect x={188} y={64} width={10} height={8} rx={3} fill={accent} />
    <Wheels
      positions={[
        { x: 48, y: 87 },
        { x: 148, y: 87 },
        { x: 184, y: 87 },
      ]}
      color={wheel}
      hub={hub}
    />
  </G>
);

const TractorShape = ({
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
    <Circle cx={158} cy={78} r={23} fill={wheel} />
    <Circle cx={158} cy={78} r={10} fill={hub} />
    <Circle cx={52} cy={88} r={13} fill={wheel} />
    <Circle cx={52} cy={88} r={6} fill={hub} />
    <Rect x={54} y={50} width={82} height={30} rx={5} fill={body} />
    <Path d="M102 50 L112 30 L150 30 L158 50 Z" fill={body} />
    <Path d="M116 34 L126 34 L132 50 L112 50 Z" fill={window} opacity={0.9} />
    <Rect x={128} y={16} width={5} height={18} rx={2} fill={dark} />
    <Rect x={46} y={58} width={16} height={8} rx={3} fill={accent} />
  </G>
);

const BackhoeShape = ({
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
    <Circle cx={150} cy={82} r={20} fill={wheel} />
    <Circle cx={150} cy={82} r={9} fill={hub} />
    <Circle cx={54} cy={88} r={12} fill={wheel} />
    <Circle cx={54} cy={88} r={5} fill={hub} />
    <Rect x={54} y={52} width={76} height={28} rx={5} fill={body} />
    <Path d="M96 52 L106 34 L142 34 L148 52 Z" fill={body} />
    <Path d="M110 38 L120 38 L126 52 L106 52 Z" fill={window} opacity={0.9} />
    <Path
      d="M142 44 L176 22 L202 46 L202 56 L176 40 L148 58"
      stroke={accent}
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M192 46 L206 58 L198 66 L184 54 Z" fill={accent} />
  </G>
);

const ExcavatorShape = ({
  body,
  dark,
  window,
  wheel,
  accent,
}: {
  body: string;
  dark: string;
  window: string;
  wheel: string;
  accent: string;
}) => (
  <G>
    <Rect x={28} y={76} width={150} height={18} rx={9} fill={dark} />
    <Circle cx={54} cy={85} r={7} fill={wheel} />
    <Circle cx={150} cy={85} r={7} fill={wheel} />
    <Rect x={58} y={44} width={72} height={34} rx={6} fill={body} />
    <Path d="M74 44 L86 30 L118 30 L124 44 Z" fill={body} />
    <Path d="M88 34 L104 34 L110 44 L84 44 Z" fill={window} opacity={0.9} />
    <Path
      d="M122 46 L166 24 L190 50"
      stroke={body}
      strokeWidth={8}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M182 42 L206 58 L196 70 L176 54 Z" fill={accent} />
  </G>
);

const LoaderShape = ({
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
    <Rect x={44} y={48} width={94} height={32} rx={5} fill={body} />
    <Path d="M76 48 L88 32 L124 32 L132 48 Z" fill={body} />
    <Path d="M92 36 L108 36 L114 48 L86 48 Z" fill={window} opacity={0.9} />
    <Path
      d="M136 58 L176 52 L198 70 L198 78 L172 64 L136 72 Z"
      fill={accent}
    />
    <Circle cx={60} cy={84} r={18} fill={wheel} />
    <Circle cx={60} cy={84} r={8} fill={hub} />
    <Circle cx={122} cy={84} r={18} fill={wheel} />
    <Circle cx={122} cy={84} r={8} fill={hub} />
    <Path d="M44 58 L42 68" stroke={dark} strokeWidth={3} />
  </G>
);

const CraneShape = ({
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
    <Rect x={22} y={62} width={130} height={22} rx={4} fill={body} />
    <Path d="M152 62 L180 24 L194 24 L194 34 L184 34 L160 66 Z" fill={body} />
    <Path d="M180 30 L204 62" stroke={dark} strokeWidth={4} />
    <Path d="M198 56 L202 78" stroke={accent} strokeWidth={3} />
    <Path d="M192 80 L208 80 L200 92 Z" fill={accent} />
    <Rect x={30} y={56} width={28} height={22} rx={4} fill={window} opacity={0.9} />
    <Wheels
      positions={[
        { x: 48, y: 86 },
        { x: 132, y: 86 },
      ]}
      color={wheel}
      hub={hub}
    />
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
  const normalizedType: VehicleType = normalizeVehicleType(type);

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
        {normalizedType === 'suv' ? (
          <SuvShape {...shapeProps} />
        ) : normalizedType === 'pickup' ? (
          <PickupShape {...shapeProps} />
        ) : normalizedType === 'camioneta' ? (
          <CrossoverShape {...shapeProps} />
        ) : normalizedType === 'furgon' ? (
          <VanShape {...shapeProps} />
        ) : normalizedType === 'bus' ? (
          <BusShape {...shapeProps} />
        ) : normalizedType === 'microbus' ? (
          <MicrobusShape {...shapeProps} />
        ) : normalizedType === 'camion' ? (
          <CamionShape {...shapeProps} />
        ) : normalizedType === 'motorcycle' ? (
          <MotorcycleShape
            body={body}
            dark={dark}
            seat={seat}
            wheel={wheel}
            hub={hub}
            accent={accent}
          />
        ) : normalizedType === 'tractor' ? (
          <TractorShape {...shapeProps} />
        ) : normalizedType === 'retroexcavadora' ? (
          <BackhoeShape {...shapeProps} />
        ) : normalizedType === 'excavadora' ? (
          <ExcavatorShape
            body={body}
            dark={dark}
            window={window}
            wheel={wheel}
            accent={accent}
          />
        ) : normalizedType === 'cargador' ? (
          <LoaderShape {...shapeProps} />
        ) : normalizedType === 'grua' ? (
          <CraneShape {...shapeProps} />
        ) : normalizedType === 'other' ? (
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
