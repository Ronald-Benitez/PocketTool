import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import {
  resolveVehicleColor,
  shadeVehicleColor,
} from '@/src/domain/vehicle/colors';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { AppText } from '@/src/ui/primitives/AppText';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type PaymentMethodVisualProps = {
  kind?: string | null;
  brand?: string | null;
  style?: string | null;
  color?: string | null;
  name?: string;
  last4?: string | null;
  holder?: string | null;
  issuer?: string | null;
  limitCents?: number | null;
  usedCents?: number | null;
  closingDate?: number | null;
  paymentDate?: number | null;
  height?: number;
  compact?: boolean;
};

const isLight = (hex: string) => {
  const value = hex.replace('#', '');
  if (value.length < 6) return true;
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 165;
};

const brandTone = (brand?: string | null) => {
  switch (brand) {
    case 'visa':
      return 'VISA';
    case 'amex':
      return 'AMEX';
    case 'mastercard':
      return 'mastercard';
    case 'discover':
      return 'DISCOVER';
    case 'diners':
      return 'DINERS';
    case 'jcb':
      return 'JCB';
    case 'unionpay':
      return 'UNIONPAY';
    default:
      return 'CARD';
  }
};

const CardText = ({
  text,
  color,
  size = 12,
  weight = '600',
  align,
}: {
  text: string;
  color: string;
  size?: number;
  weight?: '400' | '600' | '700' | '800';
  align?: 'left' | 'right';
}) => (
  <AppText
    variant='caption'
    numberOfLines={1}
    style={{
      color,
      fontSize: size,
      fontWeight: weight,
      textAlign: align,
    }}
  >
    {text}
  </AppText>
);

const CardBrand = ({
  brand,
  textColor,
}: {
  brand?: string | null;
  textColor: string;
}) => {
  if (brand === 'mastercard') {
    return (
      <View style={styles.mastercard}>
        <View style={[styles.mastercardCircle, { backgroundColor: '#EB001B' }]} />
        <View
          style={[
            styles.mastercardCircle,
            styles.mastercardSecond,
            { backgroundColor: '#F79E1B' },
          ]}
        />
      </View>
    );
  }
  return <CardText text={brandTone(brand)} color={textColor} size={16} weight='800' />;
};

const NonCardVisual = ({
  kind,
  color,
  height,
}: {
  kind: string;
  color: string;
  height: number;
}) => {
  const dark = shadeVehicleColor(color, -0.25);
  const light = shadeVehicleColor(color, 0.2);
  return (
    <Svg viewBox='0 0 220 130' width='100%' height={height}>
      <Ellipse cx={110} cy={119} rx={82} ry={6} fill='#000' opacity={0.12} />
      {kind === 'cash' ? (
        <>
          <Rect x={38} y={52} width={144} height={42} rx={8} fill={dark} />
          <Rect x={32} y={44} width={144} height={42} rx={8} fill={color} />
          <Rect x={26} y={36} width={144} height={42} rx={8} fill={light} />
          <Circle cx={98} cy={57} r={15} fill={dark} opacity={0.4} />
          <Path d='M44 48 H80 M160 72 H120' stroke={dark} strokeWidth={4} strokeLinecap='round' />
        </>
      ) : kind === 'piggy_bank' ? (
        <>
          <Ellipse cx={116} cy={70} rx={62} ry={38} fill={color} />
          <Circle cx={64} cy={72} r={25} fill={light} />
          <Circle cx={172} cy={72} r={13} fill={dark} />
          <Circle cx={158} cy={42} r={8} fill={color} />
          <Rect x={52} y={88} width={18} height={24} rx={7} fill={dark} />
          <Rect x={150} y={88} width={18} height={24} rx={7} fill={dark} />
          <Rect x={100} y={42} width={26} height={6} rx={3} fill={dark} />
          <Circle cx={64} cy={66} r={4} fill={dark} />
        </>
      ) : kind === 'transfer' ? (
        <>
          <Rect x={56} y={46} width={108} height={58} rx={6} fill={color} />
          <Path d='M48 46 L110 20 L172 46 Z' fill={light} />
          <Rect x={72} y={62} width={16} height={30} fill={dark} opacity={0.5} />
          <Rect x={132} y={62} width={16} height={30} fill={dark} opacity={0.5} />
          <Path d='M90 90 L130 90 M120 80 L130 90 L120 100' stroke={dark} strokeWidth={5} fill='none' strokeLinecap='round' strokeLinejoin='round' />
        </>
      ) : kind === 'wallet' ? (
        <>
          <Rect x={34} y={38} width={152} height={72} rx={12} fill={color} />
          <Rect x={34} y={38} width={152} height={20} rx={10} fill={light} />
          <Rect x={136} y={62} width={50} height={28} rx={9} fill={dark} />
          <Circle cx={162} cy={76} r={5} fill={light} />
        </>
      ) : kind === 'gift_card' ? (
        <>
          <Rect x={34} y={38} width={152} height={72} rx={10} fill={color} />
          <Rect x={96} y={38} width={18} height={72} fill={light} />
          <Path d='M105 38 C70 10 52 28 68 39 C82 48 98 40 105 38 Z' fill={light} />
          <Path d='M105 38 C140 10 158 28 142 39 C128 48 112 40 105 38 Z' fill={light} />
          <Rect x={54} y={60} width={38} height={5} rx={2} fill={dark} opacity={0.5} />
        </>
      ) : (
        <>
          <Rect x={38} y={32} width={144} height={72} rx={10} fill={color} />
          <Rect x={38} y={32} width={144} height={18} rx={8} fill={light} />
          <Circle cx={150} cy={76} r={12} fill={dark} opacity={0.5} />
          <Rect x={54} y={66} width={56} height={6} rx={3} fill={dark} opacity={0.5} />
        </>
      )}
    </Svg>
  );
};

export const PaymentMethodVisual = ({
  kind,
  brand,
  style,
  color,
  name,
  last4,
  holder,
  issuer,
  limitCents,
  usedCents,
  closingDate,
  paymentDate,
  height = 120,
  compact = false,
}: PaymentMethodVisualProps) => {
  const { colors } = useTheme();
  const { t } = useLanguage();
  const translateY = useSharedValue(12);
  const float = useSharedValue(0);

  useEffect(() => {
    translateY.value = 12;
    float.value = 0;
    translateY.value = withSpring(0, { damping: 13, stiffness: 120 });
    float.value = withRepeat(withTiming(-2, { duration: 1900 }), -1, true);
  }, [translateY, float]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value + float.value }],
  }));

  const visualKind =
    kind ??
    (closingDate ? 'credit_card' : 'other');
  const resolved = resolveVehicleColor(color);
  const isCard = visualKind === 'credit_card' || visualKind === 'debit_card';

  if (!isCard) {
    return (
      <Animated.View style={[styles.nonCardWrap, animatedStyle]}>
        <NonCardVisual kind={visualKind} color={resolved} height={height} />
      </Animated.View>
    );
  }

  const textColor = isLight(resolved) ? '#111827' : '#F8FAFC';
  const cardStyle = style ?? 'matte';
  const gradient =
    cardStyle === 'metallic'
      ? ([shadeVehicleColor(resolved, 0.22), resolved, shadeVehicleColor(resolved, -0.28)] as const)
      : cardStyle === 'gradient'
        ? ([shadeVehicleColor(resolved, 0.3), resolved, shadeVehicleColor(resolved, -0.2)] as const)
        : ([resolved, resolved] as const);
  const available =
    limitCents != null && usedCents != null
      ? Math.max(0, limitCents - usedCents)
      : null;

  return (
    <Animated.View style={[styles.cardWrap, animatedStyle]}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.card,
          {
            borderColor: colors.border,
            shadowColor: colors.shadow,
            opacity: cardStyle === 'transparent' ? 0.9 : 1,
          },
        ]}
      >
        <View style={[styles.cardGlow, { backgroundColor: textColor }]} />
        <View style={styles.cardTop}>
          <View style={styles.chip}>
            <View style={[styles.chipLine, { backgroundColor: '#B7791F' }]} />
            <View style={[styles.chipLine, { backgroundColor: '#B7791F' }]} />
          </View>
          <View style={styles.cardTopRight}>
            <MaterialIcons name='wifi' size={18} color={textColor} style={styles.contactless} />
            <CardBrand brand={brand} textColor={textColor} />
          </View>
        </View>
        <View style={styles.cardMiddle}>
          <CardText
            text={`••••  ••••  ••••  ${last4 ?? '••••'}`}
            color={textColor}
            size={15}
            weight='700'
          />
        </View>
        <View style={styles.cardBottom}>
          <View style={styles.cardBottomBlock}>
            <CardText text={holder || name || ' '} color={textColor} size={11} />
            <CardText
              text={
                issuer ||
                t(
                  visualKind === 'credit_card'
                    ? 'paymentMethods.type.credit'
                    : 'paymentMethods.type.debit'
                )
              }
              color={textColor}
              size={10}
              weight='700'
            />
          </View>
          {!compact ? (
            <View style={styles.cardBottomRight}>
              {visualKind === 'credit_card' && limitCents != null ? (
                <CardText
                  text={`${t('paymentMethods.limitShort')} ${formatMoneyWithSymbol(
                    limitCents
                  )}`}
                  color={textColor}
                  size={9}
                  align='right'
                />
              ) : null}
              {visualKind === 'credit_card' && available != null ? (
                <CardText
                  text={`${t(
                    'paymentMethods.availableShort'
                  )} ${formatMoneyWithSymbol(available)}`}
                  color={textColor}
                  size={9}
                  align='right'
                />
              ) : null}
              {closingDate ? (
                <CardText
                  text={`${t('paymentMethods.closingShort')} ${closingDate} · ${t(
                    'paymentMethods.paymentShort'
                  )} ${paymentDate ?? '—'}`}
                  color={textColor}
                  size={9}
                  align='right'
                />
              ) : null}
            </View>
          ) : null}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrap: {
    width: '100%',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
    borderRadius: 18,
  },
  card: {
    width: '100%',
    aspectRatio: 1.586,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  cardGlow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.08,
    top: -80,
    right: -70,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactless: {
    transform: [{ rotate: '90deg' }],
    opacity: 0.85,
  },
  chip: {
    width: 38,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#E7C873',
    padding: 5,
    justifyContent: 'space-between',
  },
  chipLine: {
    height: 2,
    borderRadius: 1,
    opacity: 0.6,
  },
  cardMiddle: {
    marginTop: 14,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
  },
  cardBottomBlock: {
    gap: 2,
    flexShrink: 1,
  },
  cardBottomRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  mastercard: {
    width: 36,
    height: 24,
    justifyContent: 'center',
  },
  mastercardCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    position: 'absolute',
    left: 0,
  },
  mastercardSecond: {
    left: 12,
    opacity: 0.9,
  },
  nonCardWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
