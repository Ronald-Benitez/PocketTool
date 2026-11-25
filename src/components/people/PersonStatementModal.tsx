import React from 'react';
import { StyleSheet, View } from 'react-native';

import type { PersonStatement } from '@/src/db';
import type { Person } from '@/src/interfaces/schema';
import type { TranslationKey } from '@/src/lang/messages';
import { useLanguage } from '@/src/lang/LanguageContext';
import { formatMoneyWithSymbol } from '@/src/utils';
import { Button } from '@/src/ui/actions/Button';
import { Badge } from '@/src/ui/data-display/Badge';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { Modal } from '@/src/ui/overlays/Modal';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Surface } from '@/src/ui/primitives/Surface';

type PersonStatementModalProps = {
  visible: boolean;
  person: Person | null;
  statement?: PersonStatement;
  onClose: () => void;
  onRegisterPayment?: () => void;
};

const sourceLabel = (
  t: (key: TranslationKey) => string,
  source: string
): string => {
  if (source === 'fixed') return t('shared.fromFixed');
  if (source === 'financing') return t('shared.fromFinancing');
  if (source === 'settlement') return t('shared.settlement');
  return t('shared.fromRecord');
};

export const PersonStatementModal = ({
  visible,
  person,
  statement,
  onClose,
  onRegisterPayment,
}: PersonStatementModalProps) => {
  const { t } = useLanguage();
  const entries = statement?.entries ?? [];
  const summary = statement?.summary;
  const showSummary = Boolean(
    summary && entries.some((entry) => entry.kind !== 'financing')
  );

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={`${t('shared.statement')}${person ? ` · ${person.name}` : ''}`}
      closeLabel={t('close')}
      scrollable
      footer={
        <View style={styles.footer}>
          {summary && summary.balanceCents !== 0 && onRegisterPayment ? (
            <Button
              label={t('shared.registerPayment')}
              onPress={onRegisterPayment}
              style={styles.footerButton}
            />
          ) : null}
          <Button
            label={t('close')}
            variant='outline'
            onPress={onClose}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <Stack gap='md'>
        {showSummary && summary ? (
          <Surface variant='muted' padding='md'>
            <Stack gap='xs'>
              <Row justify='space-between'>
                <AppText color='muted'>{t('shared.paidByYou')}</AppText>
                <AppText weight='600'>
                  {formatMoneyWithSymbol(summary.paidByMeCents)}
                </AppText>
              </Row>
              <Row justify='space-between'>
                <AppText color='muted'>{t('shared.paidByThem')}</AppText>
                <AppText weight='600'>
                  {formatMoneyWithSymbol(summary.paidByPersonCents)}
                </AppText>
              </Row>
              <Row justify='space-between' align='center'>
                <AppText weight='600'>{t('shared.balance')}</AppText>
                <FinanceValue
                  cents={summary.balanceCents}
                  size='md'
                  tone={
                    summary.balanceCents > 0
                      ? 'income'
                      : summary.balanceCents < 0
                        ? 'expense'
                        : 'neutral'
                  }
                />
              </Row>
              <AppText variant='caption' color='muted'>
                {summary.balanceCents > 0
                  ? t('shared.balanceInYourFavor')
                  : summary.balanceCents < 0
                    ? t('shared.balanceInTheirFavor')
                    : t('shared.settled')}
              </AppText>
            </Stack>
          </Surface>
        ) : null}

        {entries.length === 0 ? (
          <EmptyState title={t('shared.noMovements')} />
        ) : (
          <Stack gap='sm'>
            {entries.map((entry) => {
              const isPurchase = entry.kind === 'purchase';
              const isSettlement = entry.kind === 'settlement';
              const isFinancing = entry.kind === 'financing';
              const directionLabel = isSettlement
                ? entry.settlementDirection === 'i_paid_them'
                  ? t('shared.iPaidThem')
                  : t('shared.theyPaidMe')
                : entry.direction === 'theyOweMe'
                  ? t('shared.theyOweYou')
                  : entry.direction === 'iOweThem'
                    ? t('shared.youOweThem')
                    : null;
              const displayCents =
                entry.kind === 'financing'
                  ? entry.shareCents ?? 0
                  : Math.abs(entry.balanceDeltaCents) ||
                    entry.shareCents ||
                    entry.totalCents ||
                    0;

              return (
                <Surface key={entry.key} variant='outlined' padding='md'>
                  <Stack gap='xs'>
                    <Row justify='space-between' align='center' gap='sm'>
                      <Stack gap='xxs' style={{ flex: 1 }}>
                        <AppText numberOfLines={1}>
                          {entry.label || t('shared.settlement')}
                        </AppText>
                        <AppText variant='caption' color='muted'>
                          {new Date(entry.date).toLocaleDateString()} ·{' '}
                          {sourceLabel(t, entry.source)}
                          {isPurchase && entry.sharePercent != null
                            ? ` · ${entry.sharePercent.toFixed(0)}%`
                            : ''}
                        </AppText>
                      </Stack>
                      <Badge
                        label={
                          isFinancing
                            ? t('shared.informational')
                            : isSettlement
                              ? t('shared.settlement')
                              : t('shared.purchase')
                        }
                        tone={
                          isFinancing
                            ? 'neutral'
                            : isSettlement
                              ? 'info'
                              : 'primary'
                        }
                        size='sm'
                      />
                    </Row>

                    {isPurchase ? (
                      <Row justify='space-between' align='center' gap='sm'>
                        <Stack gap='xxs' style={{ flex: 1 }}>
                          <AppText variant='caption' color='muted'>
                            {t('shared.totalPurchase')}:{' '}
                            {formatMoneyWithSymbol(entry.totalCents ?? 0)}
                          </AppText>
                          <AppText variant='caption' color='muted'>
                            {t('shared.yourPart')}:{' '}
                            {formatMoneyWithSymbol(entry.ownCents ?? 0)} ·{' '}
                            {t('shared.theirPart')}:{' '}
                            {formatMoneyWithSymbol(entry.shareCents ?? 0)}
                          </AppText>
                          <AppText variant='caption' color='muted'>
                            {entry.paidByMe
                              ? t('shared.paidByYou')
                              : t('shared.paidByThem')}
                          </AppText>
                        </Stack>
                        <Stack gap='xxs' align='flex-end'>
                          <FinanceValue
                            cents={entry.shareCents ?? 0}
                            size='md'
                            tone='neutral'
                          />
                          {directionLabel ? (
                            <AppText variant='caption' color='muted'>
                              {directionLabel}
                            </AppText>
                          ) : null}
                        </Stack>
                      </Row>
                    ) : (
                      <Row justify='space-between' align='center' gap='sm'>
                        <AppText variant='caption' color='muted'>
                          {directionLabel}
                        </AppText>
                        <FinanceValue
                          cents={displayCents}
                          size='md'
                          tone='neutral'
                        />
                      </Row>
                    )}
                  </Stack>
                </Surface>
              );
            })}
          </Stack>
        )}
      </Stack>
    </Modal>
  );
};

const styles = StyleSheet.create({
  footer: { flex: 1, flexDirection: 'row', gap: 8 },
  footerButton: { flex: 1 },
});
