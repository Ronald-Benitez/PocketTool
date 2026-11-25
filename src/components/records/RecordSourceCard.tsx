import React from 'react';
import { View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import type { RecordSource } from '@/src/db/repositories/recordSources';
import { useFeature } from '@/src/features';
import useDate from '@/src/hooks/useDate';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { Badge } from '@/src/ui/data-display/Badge';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type Props = {
  sources: RecordSource[];
  onOpen: (source: RecordSource) => void;
};

const SOURCE_ICON: Record<
  RecordSource['kind'],
  React.ComponentProps<typeof MaterialCommunityIcons>['name']
> = {
  fixed: 'calendar-clock',
  saving: 'piggy-bank-outline',
  financing: 'bank-outline',
  vehicle_fuel: 'gas-station-outline',
  vehicle_maintenance: 'wrench-outline',
  shopping: 'cart-outline',
  credit: 'credit-card-outline',
};

const SOURCE_LABEL: Record<RecordSource['kind'], string> = {
  fixed: 'recordSources.kinds.fixed',
  saving: 'recordSources.kinds.saving',
  financing: 'recordSources.kinds.financing',
  vehicle_fuel: 'recordSources.kinds.fuel',
  vehicle_maintenance: 'recordSources.kinds.maintenance',
  shopping: 'recordSources.kinds.shopping',
  credit: 'recordSources.kinds.credit',
};

const Fact = ({ label, value }: { label: string; value: string }) => (
  <Row justify='space-between' gap='sm'>
    <AppText variant='caption' color='muted'>
      {label}
    </AppText>
    <AppText variant='caption' numberOfLines={1} style={{ flexShrink: 1 }}>
      {value}
    </AppText>
  </Row>
);

export const RecordSourceCard = ({ sources, onOpen }: Props) => {
  const { t } = useLanguage();
  const { colors } = useTheme();
  const dateH = useDate();
  const showFixeds = useFeature('fixeds');
  const showSavings = useFeature('savings');
  const showFinancings = useFeature('financings');
  const showVehicle = useFeature('vehicle');
  const showShopping = useFeature('shopping');
  const showCredits = useFeature('credits');

  if (sources.length === 0) return null;

  const canOpen: Record<RecordSource['kind'], boolean> = {
    fixed: showFixeds,
    saving: showSavings,
    financing: showFinancings,
    vehicle_fuel: showVehicle,
    vehicle_maintenance: showVehicle,
    shopping: showShopping,
    credit: showCredits,
  };

  const money = (cents: number | null | undefined) =>
    cents == null ? '—' : formatMoneyWithSymbol(cents);

  const sourceTitle = (source: RecordSource) => {
    if (source.kind === 'vehicle_maintenance') {
      return source.title || source.serviceType;
    }
    return source.name || t(SOURCE_LABEL[source.kind] as never);
  };

  const sourceSubtitle = (source: RecordSource) => {
    const parts = [t(SOURCE_LABEL[source.kind] as never)];
    if (source.kind === 'vehicle_maintenance' && source.name) {
      parts.push(source.name);
    }
    if ('date' in source && source.date != null) {
      parts.push(dateH.getStringDate(source.date));
    }
    return parts.join(' · ');
  };

  const renderFacts = (source: RecordSource) => {
    switch (source.kind) {
      case 'fixed':
        return <Fact label={t('recordSources.amount')} value={money(source.amountCents)} />;
      case 'saving':
        return (
          <>
            <Fact
              label={t('recordSources.movement')}
              value={t(
                `recordSources.movementKinds.${source.movementKind}` as never
              )}
            />
            <Fact label={t('recordSources.amount')} value={money(source.amountCents)} />
            {source.movementKind !== 'payment' ? (
              <>
                <Fact
                  label={t('recordSources.previousBalance')}
                  value={money(source.previousAmountCents)}
                />
                <Fact
                  label={t('recordSources.newBalance')}
                  value={money(source.newAmountCents)}
                />
              </>
            ) : null}
            {source.note ? (
              <Fact label={t('recordSources.note')} value={source.note} />
            ) : null}
          </>
        );
      case 'financing':
        return (
          <>
            <Fact label={t('recordSources.amount')} value={money(source.amountCents)} />
            <Fact
              label={t('recordSources.principal')}
              value={money(source.principalCents)}
            />
            <Fact
              label={t('recordSources.interest')}
              value={money(source.interestCents)}
            />
            <Fact
              label={t('recordSources.insurance')}
              value={money(source.insuranceCents)}
            />
            <Fact label={t('recordSources.fees')} value={money(source.feesCents)} />
          </>
        );
      case 'vehicle_fuel':
        return (
          <>
            <Fact
              label={t('recordSources.cost')}
              value={money(source.totalCostCents)}
            />
            <Fact
              label={t('recordSources.odometer')}
              value={
                source.odometer == null
                  ? '—'
                  : `${source.odometer} ${source.distanceUnit}`
              }
            />
            <Fact
              label={t('recordSources.volume')}
              value={
                source.volume == null
                  ? '—'
                  : `${source.volume} ${source.volumeUnit}`
              }
            />
            <Fact
              label={t('recordSources.fullTank')}
              value={source.isFullTank ? t('recordSources.yes') : t('recordSources.no')}
            />
          </>
        );
      case 'vehicle_maintenance':
        return (
          <>
            <Fact label={t('recordSources.cost')} value={money(source.costCents)} />
            <Fact
              label={t('recordSources.serviceType')}
              value={source.serviceType}
            />
            <Fact
              label={t('recordSources.odometer')}
              value={
                source.odometer == null
                  ? '—'
                  : `${source.odometer} ${source.distanceUnit}`
              }
            />
            {source.items.length > 0 ? (
              <View style={{ gap: 4 }}>
                <AppText variant='caption' color='muted'>
                  {t('recordSources.items')}
                </AppText>
                {source.items.slice(0, 4).map((item) => (
                  <Row key={item.id} justify='space-between' gap='sm'>
                    <AppText variant='caption' numberOfLines={1} style={{ flex: 1 }}>
                      {item.name}
                    </AppText>
                    <AppText variant='caption' color='muted'>
                      {money(item.costCents)}
                    </AppText>
                  </Row>
                ))}
                {source.items.length > 4 ? (
                  <AppText variant='caption' color='muted'>
                    {t('recordSources.moreItems', {
                      count: source.items.length - 4,
                    })}
                  </AppText>
                ) : null}
              </View>
            ) : null}
          </>
        );
      case 'shopping':
        return (
          <>
            <Row justify='space-between' gap='sm'>
              <AppText variant='caption' color='muted'>
                {t('recordSources.status')}
              </AppText>
              <Badge
                label={
                  source.status === 'closed'
                    ? t('shopping.status.closed')
                    : t('shopping.status.open')
                }
                tone={source.status === 'closed' ? 'success' : 'info'}
                size='sm'
              />
            </Row>
            <Fact label={t('recordSources.total')} value={money(source.totalCents)} />
            <Fact
              label={t('recordSources.checked')}
              value={`${source.checkedCount} / ${source.items.length}`}
            />
            {source.items.length > 0 ? (
              <View style={{ gap: 4 }}>
                {source.items.slice(0, 4).map((item) => (
                  <Row key={item.id} justify='space-between' gap='sm'>
                    <Row gap='xs' align='center' style={{ flex: 1 }}>
                      <Ionicons
                        name={
                          item.isChecked ? 'checkmark-circle' : 'ellipse-outline'
                        }
                        size={14}
                        color={item.isChecked ? colors.success : colors.textMuted}
                      />
                      <AppText variant='caption' numberOfLines={1} style={{ flex: 1 }}>
                        {item.name}
                      </AppText>
                    </Row>
                    <AppText variant='caption' color='muted'>
                      {item.priceCents == null
                        ? t('shopping.item.noPrice')
                        : money(item.priceCents)}
                    </AppText>
                  </Row>
                ))}
                {source.items.length > 4 ? (
                  <AppText variant='caption' color='muted'>
                    {t('recordSources.moreItems', {
                      count: source.items.length - 4,
                    })}
                  </AppText>
                ) : null}
              </View>
            ) : null}
          </>
        );
      case 'credit':
        return (
          <>
            <Fact label={t('recordSources.amount')} value={money(source.amountCents)} />
            {source.methodName ? (
              <Fact
                label={t('recordSources.paymentMethod')}
                value={source.methodName}
              />
            ) : null}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Stack gap='sm'>
      <AppText variant='caption' color='muted'>
        {t('recordSources.title')}
      </AppText>
      {sources.map((source) => (
        <Surface
          key={`${source.kind}-${source.id}`}
          variant='muted'
          padding='md'
        >
          <Stack gap='sm'>
            <Row justify='space-between' align='center' gap='sm'>
              <Row gap='sm' align='center' style={{ flex: 1 }}>
                <MaterialCommunityIcons
                  name={SOURCE_ICON[source.kind]}
                  size={22}
                  color={colors.primary}
                />
                <Stack flex={1} gap='xxs'>
                  <AppText variant='label' numberOfLines={1}>
                    {sourceTitle(source)}
                  </AppText>
                  <AppText variant='caption' color='muted' numberOfLines={1}>
                    {sourceSubtitle(source)}
                  </AppText>
                </Stack>
              </Row>
              <Button
                label={t('recordSources.open')}
                size='sm'
                variant='outline'
                onPress={() => onOpen(source)}
                disabled={!canOpen[source.kind]}
              />
            </Row>
            {renderFacts(source)}
          </Stack>
        </Surface>
      ))}
    </Stack>
  );
};
