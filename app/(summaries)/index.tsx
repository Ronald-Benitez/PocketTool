import React from 'react';
import { View } from 'react-native';

import { BudgetSummaryBlock } from '@/src/components/summaries/BudgetSummaryBlock';
import { useLanguage } from '@/src/lang/LanguageContext';
import GroupSelector from '@/src/components/groups/group-selector';
import useResumesStore from '@/src/stores/ResumesStore';
import { AppText } from '@/src/ui/primitives/AppText';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { Surface } from '@/src/ui/primitives/Surface';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const Index = () => {
    const { t } = useLanguage();
    const { colors } = useTheme();
    const { balance, ownBalance, sharedBalance, balanceByRecordType } = useResumesStore()

    return (
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='lg'>
                <Row justify='center'>
                    <GroupSelector />
                </Row>

                <Surface variant='raised' padding='lg'>
                    <SummaryBlock
                        label={t('resume.balance')}
                        cents={balance}
                        size='xl'
                        labelVariant='subtitle'
                        valueColorOverride={colors.text}
                        accentColor={colors.primary}
                    />
                </Surface>

                <Row gap='md'>
                    <SummaryBlock
                        label={t('resume.own')}
                        cents={ownBalance}
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

                <BudgetSummaryBlock />

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
                                            cents={item.total}
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

export default Index;
