import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useLanguage } from '@/src/lang/LanguageContext';
import ColorSettings from "@/src/components/settings/colors-settings"
import { ExperienceSettings } from '@/src/components/settings/ExperienceSettings';
import { VehicleSettingsPanel } from '@/src/components/vehicle/VehicleSettingsPanel';
import { SavingsSettingsPanel } from '@/src/components/savings/SavingsSettingsPanel';
import { SettingsSection } from '@/src/components/settings/SettingsSection';
import { useFeatures } from '@/src/features';
import { useDBExport } from '@/src/db/utils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useConfigs } from '@/src/hooks/useConfigs';
import { useCreateCurrentGroup } from '@/src/hooks/useCreateCurrentGroup';
import type { PendingPaymentDateMode } from '@/src/domain/credits/pending';
import type {
    FixedPendingDateMode,
    FixedPendingDedupeMode,
} from '@/src/domain/records/fixedPending';
import type { GroupPeriodMode } from '@/src/domain/groups/types';
import { useDataStore } from '@/src/stores';
import { Button } from '@/src/ui/actions/Button';
import { IconButton } from '@/src/ui/actions/IconButton';
import { ColoredSelectOption } from '@/src/ui/forms/ColoredSelectOption';
import { MultiSelectField } from '@/src/ui/forms/MultiSelectField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { SwitchField } from '@/src/ui/forms/SwitchField';
import { TextField } from '@/src/ui/forms/TextField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import type { RecordType } from '@/src/interfaces/schema';

const SettingsScreen = () => {
    const { language, changeLanguage, t } = useLanguage();
    const { configs, saveConfigs, loadConfigs } = useConfigs();
    const { createCurrentGroup } = useCreateCurrentGroup();
    const exportHook = useDBExport()
    const { RecordTypes } = useDataStore()
    const { colors } = useTheme()
    const enabled = useFeatures((state) => state.enabled)
    const [search, setSearch] = useState('')

    const recordTypes = RecordTypes ?? []
    const recordTypeOptions = recordTypes.flatMap((recordType: RecordType) =>
        typeof recordType.id === 'number'
            ? [{ label: recordType.type_name, value: recordType.id }]
            : []
    )

    const colorForType = (id: number | null | undefined) =>
        recordTypes.find((recordType) => recordType.id === id)?.record_color

    const renderTypeOption = (option: { label: string; value: number }) => (
        <ColoredSelectOption
            color={colorForType(option.value)}
            label={option.label}
        />
    )

    const onPressLanguage = () => {
        if (language === "en") {
            changeLanguage("es")
        } else {
            changeLanguage("en")
        }
    }

    useEffect(() => {
        if (RecordTypes.length > 0) {
            void loadConfigs(RecordTypes)
        }
    }, [RecordTypes.length])

    const onRecordTypesChange = (values: number[]) => {
        saveConfigs({ ...configs, recordTypes: values })
    }

    const onCreditTypeChange = (id: number) => {
        saveConfigs({ ...configs, creditType: id })
    }

    const onCreditPaymentChange = (id: number) => {
        saveConfigs({ ...configs, paymentCreditType: id })
    }

    const onPendingFixedDateChange = (mode: FixedPendingDateMode) => {
        saveConfigs({ ...configs, pendingFixedDateMode: mode })
    }

    const onPendingFixedDedupeChange = (mode: FixedPendingDedupeMode) => {
        saveConfigs({ ...configs, pendingFixedDedupeMode: mode })
    }

    const onGroupAutoCreateChange = (value: boolean) => {
        saveConfigs({ ...configs, groupAutoCreate: value })
        if (value) void createCurrentGroup({ automatic: true })
    }

    const onGroupPeriodModeChange = (mode: GroupPeriodMode) => {
        saveConfigs({ ...configs, groupPeriodMode: mode })
    }

    const onGroupStartDayChange = (day: number) => {
        saveConfigs({ ...configs, groupStartDay: day })
    }

    const onClosingGraceDaysChange = (days: number) => {
        saveConfigs({ ...configs, closingGraceDays: days })
    }

    const onClosingAllowPeriodOverrideChange = (value: boolean) => {
        saveConfigs({ ...configs, closingAllowPeriodOverride: value })
    }

    return (
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='xl'>
                <AppText variant='title'>{t('settings.header')}</AppText>
                <TextField
                    label={t('settings.search')}
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t('settings.search')}
                />

                <SettingsSection
                    title={t('features.sectionTitle')}
                    description={t('features.sectionDescription')}
                    keywords={['experience', 'experiencia', 'simple', 'esencial', 'essential', 'balanced', 'equilibrado', 'complete', 'completo', 'modules', 'módulos', 'flags']}
                    search={search}
                    defaultOpen
                >
                    <ExperienceSettings />
                </SettingsSection>

                <SettingsSection
                    title={t('settings.sections.general')}
                    description={t('settings.sections.generalDescription')}
                    keywords={['language', 'idioma', 'general']}
                    search={search}
                    defaultOpen
                >
                    <Row gap='md' justify='space-between' align='center'>
                        <AppText variant='label' color='muted'>
                            {t('settings.selectLanguage')}
                        </AppText>
                        <Button
                            label={language === "en" ? t('settings.languages.english') : t('settings.languages.spanish')}
                            variant='outline'
                            size='sm'
                            onPress={onPressLanguage}
                        />
                    </Row>
                </SettingsSection>

                {enabled.advancedCatalogs || enabled.credits || enabled.fixeds ? (
                    <SettingsSection
                        title={t('settings.sections.records')}
                        description={t('settings.sections.recordsDescription')}
                        keywords={['records', 'record type', 'credit', 'registros', 'crédito', 'card payment', 'pago de tarjeta', 'fixed date', 'fecha fija', 'period', 'periodo', 'group month', 'mes del grupo']}
                        search={search}
                    >
                        {enabled.advancedCatalogs ? (
                            <>
                                <MultiSelectField<number>
                                    label={t('settings.selectRecordType')}
                                    title={t('settings.selectRecordType')}
                                    placeholder={t('settings.selectRecordType')}
                                    values={configs?.recordTypes || []}
                                    options={recordTypeOptions}
                                    onChange={onRecordTypesChange}
                                    doneLabel={t('confirm')}
                                    closeLabel={t('cancel')}
                                    renderOption={renderTypeOption}
                                />

                                <SelectField<number>
                                    label={t('settings.selectCreditExpenseType')}
                                    title={t('settings.selectCreditExpenseType')}
                                    placeholder={t('settings.selectRecordType')}
                                    value={configs?.creditType}
                                    options={recordTypeOptions}
                                    onChange={onCreditTypeChange}
                                    renderOption={renderTypeOption}
                                    closeLabel={t('cancel')}
                                />

                                <SelectField<number>
                                    label={t('settings.selectCreditPaymentType')}
                                    title={t('settings.selectCreditPaymentType')}
                                    placeholder={t('settings.selectRecordType')}
                                    value={configs?.paymentCreditType}
                                    options={recordTypeOptions}
                                    onChange={onCreditPaymentChange}
                                    renderOption={renderTypeOption}
                                    closeLabel={t('cancel')}
                                />
                            </>
                        ) : null}

                        {enabled.credits ? (
                            <SelectField<PendingPaymentDateMode>
                                label={t('settings.pendingPaymentDate')}
                                tooltip={{
                                    title: t('settings.pendingPaymentDate'),
                                    body: t('settings.pendingPaymentDateHint'),
                                }}
                                title={t('settings.pendingPaymentDate')}
                                value={configs?.pendingPaymentDateMode ?? 'today'}
                                options={[
                                    {
                                        label: t('settings.pendingPaymentDateToday'),
                                        value: 'today',
                                    },
                                    {
                                        label: t('settings.pendingPaymentDateCard'),
                                        value: 'payment_date',
                                    },
                                    {
                                        label: t('settings.pendingPaymentDateNext'),
                                        value: 'next_payment_date',
                                    },
                                ]}
                                onChange={(pendingPaymentDateMode) =>
                                    saveConfigs({ ...configs, pendingPaymentDateMode })
                                }
                                closeLabel={t('cancel')}
                            />
                        ) : null}

                        {enabled.fixeds ? (
                            <>
                                <SelectField<FixedPendingDateMode>
                                    label={t('settings.pendingFixedDate')}
                                    tooltip={{
                                        title: t('settings.pendingFixedDate'),
                                        body: t('settings.pendingFixedDateHint'),
                                    }}
                                    title={t('settings.pendingFixedDate')}
                                    value={configs?.pendingFixedDateMode ?? 'next_occurrence'}
                                    options={[
                                        {
                                            label: t('settings.pendingFixedDateGroupMonth'),
                                            value: 'group_month',
                                        },
                                        {
                                            label: t('settings.pendingFixedDateNext'),
                                            value: 'next_occurrence',
                                        },
                                    ]}
                                    onChange={onPendingFixedDateChange}
                                    closeLabel={t('cancel')}
                                />

                                <SelectField<FixedPendingDedupeMode>
                                    label={t('settings.pendingFixedDedupe')}
                                    tooltip={{
                                        title: t('settings.pendingFixedDedupe'),
                                        body: t('settings.pendingFixedDedupeHint'),
                                    }}
                                    title={t('settings.pendingFixedDedupe')}
                                    value={configs?.pendingFixedDedupeMode ?? 'period'}
                                    options={[
                                        {
                                            label: t('settings.pendingFixedDedupeGroup'),
                                            value: 'group',
                                        },
                                        {
                                            label: t('settings.pendingFixedDedupePeriod'),
                                            value: 'period',
                                        },
                                    ]}
                                    onChange={onPendingFixedDedupeChange}
                                    closeLabel={t('cancel')}
                                />
                            </>
                        ) : null}
                    </SettingsSection>
                ) : null}

                <SettingsSection
                    title={t('settings.sections.groups')}
                    description={`${t('settings.sections.groupsDescription')}\n\n${t('settings.groupPeriodExample')}`}
                    keywords={['groups', 'grupos', 'period', 'periodo', 'automatic', 'automático', 'start day', 'día de inicio']}
                    search={search}
                >
                    <SwitchField
                        label={t('settings.groupAutoCreate')}
                        tooltip={{
                            title: t('settings.groupAutoCreate'),
                            body: t('settings.groupAutoCreateHint'),
                        }}
                        value={configs?.groupAutoCreate ?? false}
                        onChange={onGroupAutoCreateChange}
                    />

                    <SelectField<GroupPeriodMode>
                        label={t('settings.groupPeriod')}
                        tooltip={{
                            title: t('settings.groupPeriod'),
                            body: t('settings.groupPeriodHint'),
                        }}
                        title={t('settings.groupPeriod')}
                        value={configs?.groupPeriodMode ?? 'calendar_month'}
                        options={[
                            {
                                label: t('settings.groupPeriodCalendar'),
                                value: 'calendar_month',
                            },
                            {
                                label: t('settings.groupPeriodStartDay'),
                                value: 'start_day',
                            },
                        ]}
                        onChange={onGroupPeriodModeChange}
                        closeLabel={t('cancel')}
                    />

                    {configs?.groupPeriodMode === 'start_day' ? (
                        <SelectField<number>
                            label={t('settings.groupStartDay')}
                            tooltip={{
                                title: t('settings.groupStartDay'),
                                body: t('settings.groupStartDayHint'),
                            }}
                            title={t('settings.groupStartDay')}
                            value={configs?.groupStartDay ?? 1}
                            options={Array.from({ length: 31 }, (_, index) => ({
                                label: String(index + 1),
                                value: index + 1,
                            }))}
                            onChange={onGroupStartDayChange}
                            closeLabel={t('cancel')}
                        />
                    ) : null}

                    <Button
                        label={t('settings.groupCreateNow')}
                        variant='outline'
                        onPress={() => void createCurrentGroup()}
                    />
                </SettingsSection>

                {enabled.closing ? (
                    <SettingsSection
                        title={t('settings.sections.closing')}
                    description={`${t('settings.sections.closingDescription')}\n\n${t('settings.closingPeriodExample')}`}
                    keywords={['closing', 'cierre', 'grace', 'gracia', 'deadline', 'límite', 'override', 'ajustar']}
                    search={search}
                >
                    <SelectField<number>
                        label={t('settings.closingGraceDays')}
                        tooltip={{
                            title: t('settings.closingGraceDays'),
                            body: t('settings.closingGraceDaysHint'),
                        }}
                        title={t('settings.closingGraceDays')}
                        value={configs?.closingGraceDays ?? 5}
                        options={Array.from({ length: 32 }, (_, index) => ({
                            label: String(index),
                            value: index,
                        }))}
                        onChange={onClosingGraceDaysChange}
                        closeLabel={t('cancel')}
                    />

                    <SwitchField
                        label={t('settings.closingAllowPeriodOverride')}
                        tooltip={{
                            title: t('settings.closingAllowPeriodOverride'),
                            body: t('settings.closingAllowPeriodOverrideHint'),
                        }}
                        value={configs?.closingAllowPeriodOverride ?? true}
                        onChange={onClosingAllowPeriodOverrideChange}
                    />
                    </SettingsSection>
                ) : null}

                <SettingsSection
                    title={t('settings.sections.backup')}
                    description={t('settings.sections.backupDescription')}
                    keywords={['backup', 'export', 'import', 'respaldo', 'exportar', 'importar']}
                    search={search}
                >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                        <IconButton
                            label={t('settings.export')}
                            variant='surface'
                            icon={<MaterialCommunityIcons name="cloud-upload-outline" size={24} color={colors.text} />}
                            onPress={() => exportHook.exportDatabase()}
                        />
                        <IconButton
                            label={t('settings.import')}
                            variant='surface'
                            icon={<MaterialCommunityIcons name="cloud-download-outline" size={24} color={colors.text} />}
                            onPress={() => exportHook.importDatabase()}
                        />
                    </View>
                </SettingsSection>

                {enabled.savings ? (
                    <SettingsSection
                        title={t('settings.sections.savings')}
                    description={t('settings.sections.savingsDescription')}
                    keywords={['savings', 'ahorros', 'trophy', 'trofeo', 'record']}
                    search={search}
                >
                        <SavingsSettingsPanel />
                    </SettingsSection>
                ) : null}

                {enabled.vehicle ? (
                    <SettingsSection
                        title={t('settings.sections.vehicle')}
                    description={t('settings.sections.vehicleDescription')}
                    keywords={['vehicle', 'vehículo', 'fuel', 'combustible', 'maintenance']}
                    search={search}
                >
                        <VehicleSettingsPanel />
                    </SettingsSection>
                ) : null}

                <SettingsSection
                    title={t('settings.sections.colors')}
                    description={t('settings.sections.colorsDescription')}
                    keywords={['colors', 'colores', 'theme', 'tema', 'palette', 'paleta']}
                    search={search}
                >
                    <ColorSettings />
                </SettingsSection>
            </Stack>
        </Screen>
    );
};

export default SettingsScreen;
