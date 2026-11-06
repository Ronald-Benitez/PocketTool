import React from 'react';
import { View } from 'react-native';

import { SummaryModeToggle } from '@/src/components/summaries/SummaryModeToggle';
import { pickSummaryAmount, useSummaryMode } from '@/src/hooks/useSummaryMode';
import { useLanguage } from '@/src/lang/LanguageContext';
import useFixedsResumesStore from '@/src/stores/FixedsResumesStore';
import { AppText } from '@/src/ui/primitives/AppText';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const RecordTypeScreen = () => {
    const { t } = useLanguage();
    const { colors } = useTheme();
    const { balance, totalBalance, sharedBalance, balanceByRecordType } = useFixedsResumesStore()
    const { mode } = useSummaryMode()
    const selectedBalance =
        mode === 'total' ? totalBalance : mode === 'shared' ? sharedBalance : balance

    return (
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='lg'>
                <SummaryModeToggle />

                <Surface variant='raised' padding='lg'>
                    <SummaryBlock
                        label={t('resume.balance')}
                        cents={selectedBalance}
                        size='xl'
                        labelVariant='subtitle'
                        valueColorOverride={colors.text}
                        accentColor={colors.primary}
                    />
                </Surface>

                <Row gap='md'>
                    <SummaryBlock
                        label={t('resume.total')}
                        cents={totalBalance}
                        size='md'
                        valueColorOverride={colors.text}
                        accentColor={colors.primary}
                        style={{ flex: 1 }}
                    />
                    <SummaryBlock
                        label={t('resume.shared')}
                        cents={sharedBalance}
                        size='md'
                        valueColorOverride={colors.textMuted}
                        accentColor={colors.textMuted}
                        style={{ flex: 1 }}
                    />
                </Row>

                <Stack gap='sm'>
                    <AppText variant='subtitle'>{t('resume.summaryByRecordType')}</AppText>
                    <Surface variant='outlined' padding='none'>
                        {balanceByRecordType && balanceByRecordType.length > 0 ? (
                            balanceByRecordType.map((item, index) => (
                                <ListItem
                                    key={item?.id ?? index}
                                    title={item.type_name}
                                    leading={
                                        <View
                                            style={{
                                                width: 4,
                                                height: 32,
                                                borderRadius: 2,
                                                backgroundColor: item.record_color ?? colors.primary,
                                            }}
                                        />
                                    }
                                    trailing={
                                        <FinanceValue
                                            cents={pickSummaryAmount(mode, item)}
                                            size='lg'
                                            color={colors.text}
                                        />
                                    }
                                    showDivider={index < balanceByRecordType.length - 1}
                                />
                            ))
                        ) : (
                            <AppText color='muted' style={{ padding: 16 }}>
                                {t('resume.noData')}
                            </AppText>
                        )}
                    </Surface>
                </Stack>
            </Stack>
        </Screen>
    );
};

export default RecordTypeScreen;
