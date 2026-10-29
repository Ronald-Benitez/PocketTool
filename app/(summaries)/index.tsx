import React from 'react';

import { useLanguage } from '@/src/lang/LanguageContext';
import GroupSelector from '@/src/components/groups/group-selector';
import useResumesStore from '@/src/stores/ResumesStore';
import { SummaryBlock } from '@/src/ui/data-display/SummaryBlock';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { Surface } from '@/src/ui/primitives/Surface';

const Index = () => {
    const { t } = useLanguage();
    const { balance, balanceByRecordType } = useResumesStore()

    return (
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='lg'>
                <Row justify='center'>
                    <GroupSelector />
                </Row>

                <Surface variant='outlined'>
                    <SummaryBlock
                        label={t('resume.balance')}
                        cents={balance}
                        size='xl'
                    />
                </Surface>

                <Stack gap='sm'>
                    {balanceByRecordType?.map((item) => (
                        <Surface key={item?.id} variant='muted' padding='sm'>
                            <SummaryBlock
                                label={item.type_name}
                                cents={item.total}
                                valueColorOverride={item.record_color ?? undefined}
                                size='lg'
                            />
                        </Surface>
                    ))}
                </Stack>
            </Stack>
        </Screen>
    );
};

export default Index;
