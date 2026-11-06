import React from 'react';
import Svg, {
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Rect,
  Stop,
} from 'react-native-svg';

type SavingsGoalTrophyProps = {
  color?: string;
  size?: number;
  accessibilityLabel?: string;
};

/**
 * Metallic trophy used to mark a saving whose goal was reached. The base color
 * is configurable from Settings; the highlights and shadows stay metallic.
 */
export const SavingsGoalTrophy = ({
  color = '#C9A227',
  size = 44,
  accessibilityLabel = 'Goal reached',
}: SavingsGoalTrophyProps) => (
  <Svg
    width={size}
    height={size}
    viewBox='0 0 64 64'
    accessibilityLabel={accessibilityLabel}
    accessibilityRole='image'
  >
    <Defs>
      <LinearGradient id='trophyBody' x1='0' y1='0' x2='1' y2='1'>
        <Stop offset='0' stopColor='#FFFFFF' stopOpacity={0.9} />
        <Stop offset='0.28' stopColor={color} stopOpacity={1} />
        <Stop offset='0.55' stopColor='#FFFFFF' stopOpacity={0.55} />
        <Stop offset='0.78' stopColor={color} stopOpacity={1} />
        <Stop offset='1' stopColor='#000000' stopOpacity={0.35} />
      </LinearGradient>
      <LinearGradient id='trophyHandle' x1='0' y1='0' x2='1' y2='1'>
        <Stop offset='0' stopColor='#FFFFFF' stopOpacity={0.8} />
        <Stop offset='0.5' stopColor={color} stopOpacity={1} />
        <Stop offset='1' stopColor='#000000' stopOpacity={0.3} />
      </LinearGradient>
      <LinearGradient id='trophyBase' x1='0' y1='0' x2='0' y2='1'>
        <Stop offset='0' stopColor='#FFFFFF' stopOpacity={0.75} />
        <Stop offset='0.45' stopColor={color} stopOpacity={1} />
        <Stop offset='1' stopColor='#000000' stopOpacity={0.4} />
      </LinearGradient>
    </Defs>

    <Ellipse cx='32' cy='56' rx='16' ry='3.5' fill='#000000' opacity={0.16} />

    <Path
      d='M18 12h28v10c0 8.2-6.3 14.4-14 14.4S18 30.2 18 22V12Z'
      fill='url(#trophyBody)'
      stroke='#000000'
      strokeOpacity={0.22}
      strokeWidth={1}
    />
    <Path
      d='M18 15h-5.5c-2.6 0-4.5 2-4.5 4.6 0 6.2 5.1 10.4 11.4 10.9'
      fill='none'
      stroke='url(#trophyHandle)'
      strokeWidth={3.2}
      strokeLinecap='round'
    />
    <Path
      d='M46 15h5.5c2.6 0 4.5 2 4.5 4.6 0 6.2-5.1 10.4-11.4 10.9'
      fill='none'
      stroke='url(#trophyHandle)'
      strokeWidth={3.2}
      strokeLinecap='round'
    />

    <Rect x='29' y='35' width='6' height='11' rx='2' fill='url(#trophyBase)' />
    <Path
      d='M24 47h16l2 5H22l2-5Z'
      fill='url(#trophyBase)'
      stroke='#000000'
      strokeOpacity={0.18}
      strokeWidth={1}
    />
    <Rect x='20' y='52' width='24' height='4' rx='2' fill='url(#trophyBase)' />

    <G opacity={0.9}>
      <Path
        d='m32 20 .9 1.9 2.1.3-1.5 1.5.4 2.1-1.9-1-1.9 1 .4-2.1-1.5-1.5 2.1-.3.9-1.9Z'
        fill='#FFFFFF'
        opacity={0.85}
      />
    </G>
  </Svg>
);

export default SavingsGoalTrophy;
