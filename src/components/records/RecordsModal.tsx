import React, {
    forwardRef,
    useImperativeHandle,
    useMemo,
    useState,
} from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import useDate from '@/src/hooks/useDate';
import { pickSummaryAmount, useSummaryMode } from '@/src/hooks/useSummaryMode';
import { useBalanceMode } from '@/src/hooks/useBalanceMode';
import { getRecordPaidByMeCents, getRecordReceivableCents } from '@/src/domain/summaries/cash';
import { useLanguage } from '@/src/lang/LanguageContext';
import type { OrderCondition } from '@/src/orm';
import type { RecordView } from '@/src/interfaces/schema';
import {
    matchesRecordFilters,
    sortRecords,
    type RecordFilter,
} from '@/src/domain/records/filtering';
import { Button } from '@/src/ui/actions/Button';
import { LinkButton } from '@/src/ui/actions/LinkButton';
import { Badge } from '@/src/ui/data-display/Badge';
import { FinanceValue } from '@/src/ui/data-display/FinanceValue';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { EmptyState } from '@/src/ui/feedback/EmptyState';
import { Modal } from '@/src/ui/overlays/Modal';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import RecordsFilterModal from './RecordsFilterModal';

export interface RecordsModalRef {
    open: (filteredRecords: RecordView[]) => void;
    close: () => void;
}

export const RecordsModal = forwardRef<RecordsModalRef, Record<string, unknown>>(
    (_, ref) => {
        const [records, setRecords] = useState<RecordView[]>([])
        const [visible, setVisible] = useState(false)
        const [filterVisible, setFilterVisible] = useState(false)
        const [filters, setFilters] = useState<RecordFilter[]>([])
        const [order, setOrder] = useState<OrderCondition<'Records'>[]>([])
        const { t } = useLanguage()
        const { colors } = useTheme()
        const { mode } = useSummaryMode()
        const { mode: balanceMode } = useBalanceMode()
        const dateh = useDate()

        const handleClose = () => {
            setVisible(false);
            setFilterVisible(false);
            setRecords([]);
            setFilters([]);
            setOrder([]);
        }

        const onOpen = (filteredRecords: RecordView[]) => {
            setRecords(filteredRecords)
            setFilters([])
            setOrder([])
            setVisible(true);
        }

        useImperativeHandle(ref, () => ({
            open: onOpen,
            close: handleClose,
        }));

        const filteredRecords = useMemo(() => {
            const filtered = records.filter(record => matchesRecordFilters(record, filters))
            return sortRecords(filtered, order)
        }, [records, filters, order])

        const amountLabel =
            balanceMode === 'cash'
                ? t('resume.modeCash')
                : mode === 'total'
                    ? t('shared.totalPurchase')
                    : mode === 'shared'
                        ? t('shared.totalShared')
                        : mode === 'paid'
                            ? t('resume.paid')
                            : t('shared.yourPart')

        return (
            <>
                <Modal
                    visible={visible}
                    onClose={handleClose}
                    title={t("resume.recordsDetail")}
                    closeLabel={t('close')}
                    scrollable
                    footer={
                        <Button
                            label={t('close')}
                            variant='outline'
                            onPress={handleClose}
                            style={{ flex: 1 }}
                        />
                    }
                >
                    <Stack gap='md'>
                        <Row justify='space-between' align='center'>
                            <Row gap='sm' align='center'>
                                <Button
                                    label={t('recordsFilters.title')}
                                    variant='outline'
                                    size='sm'
                                    leftIcon={<MaterialIcons name='filter-list' size={18} color={colors.primary} />}
                                    onPress={() => setFilterVisible(true)}
                                />
                                <Badge label={amountLabel} tone='neutral' size='sm' />
                                {filters.length > 0 ? (
                                    <Badge label={String(filters.length)} tone='primary' />
                                ) : null}
                            </Row>
                            {filters.length > 0 ? (
                                <LinkButton
                                    label={t('recordsFilters.clearFilters')}
                                    onPress={() => setFilters([])}
                                />
                            ) : null}
                        </Row>

                        {filteredRecords.length === 0 ? (
                            <EmptyState title={t('recordsFilters.noResults')} />
                        ) : (
                            <View>
                                {filteredRecords.map((item, index) => {
                                    const own = item.own_amount_cents ?? item.amount
                                    const sharedSnapshot = item.shared_amount_cents ?? 0
                                    const isExpense = item.effect === '-'
                                    const receivable = isExpense
                                        ? getRecordReceivableCents(item)
                                        : 0
                                    const paid = isExpense
                                        ? getRecordPaidByMeCents(item)
                                        : item.effect === '+'
                                            ? own
                                            : 0
                                    const cash = isExpense
                                        ? paid
                                        : item.effect === '+'
                                            ? own
                                            : 0
                                    return (
                                    <ListItem
                                        key={item.id ?? item.record_id ?? index}
                                        title={item.record_name}
                                        subtitle={
                                            item.paid_by_person_id != null
                                                ? `${dateh.getStringDate(item.date)} · ${t('shared.paidByName', {
                                                    name:
                                                        item.People?.name ??
                                                        t('shared.deletedPerson'),
                                                })}`
                                                : dateh.getStringDate(item.date)
                                        }
                                        leading={
                                            <View
                                                style={{
                                                    width: 4,
                                                    height: 32,
                                                    borderRadius: 2,
                                                    backgroundColor: item.RecordTypes?.record_color ?? colors.primary,
                                                }}
                                            />
                                        }
                                        trailing={<FinanceValue
                                            cents={
                                                balanceMode === 'cash'
                                                    ? cash
                                                    : pickSummaryAmount(mode, {
                                                        own,
                                                        shared: receivable,
                                                        total: own + sharedSnapshot,
                                                        paid,
                                                    })
                                            }
                                            size='md'
                                            color={colors.text}
                                        />}
                                        showDivider
                                    />
                                    )
                                })}
                            </View>
                        )}
                    </Stack>
                </Modal>

                <RecordsFilterModal
                    visible={filterVisible}
                    filters={filters}
                    order={order}
                    title={t('recordsFilters.filterTitle')}
                    onClose={() => setFilterVisible(false)}
                    onApply={async (nextFilters, nextOrder) => {
                        setFilters(nextFilters)
                        setOrder(nextOrder)
                        setFilterVisible(false)
                    }}
                    allowOrder={false}
                    storageKey={null}
                />
            </>
        )
    }
)

RecordsModal.displayName = 'RecordsModal';

export default RecordsModal;
