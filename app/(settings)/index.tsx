import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { useLanguage } from '@/src/lang/LanguageContext';
import ColorSettings from "@/src/components/settings/colors-settings"
import { VehicleSettingsPanel } from '@/src/components/vehicle/VehicleSettingsPanel';
import { SavingsSettingsPanel } from '@/src/components/savings/SavingsSettingsPanel';
import { SettingsSection } from '@/src/components/settings/SettingsSection';
import { useDBExport } from '@/src/db/utils';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useConfigs } from '@/src/hooks/useConfigs';
import { useDataStore } from '@/src/stores';
import { Button } from '@/src/ui/actions/Button';
import { IconButton } from '@/src/ui/actions/IconButton';
import { ColoredSelectOption } from '@/src/ui/forms/ColoredSelectOption';
import { MultiSelectField } from '@/src/ui/forms/MultiSelectField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { AppText } from '@/src/ui/primitives/AppText';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import type { RecordType } from '@/src/interfaces/schema';

const SettingsScreen = () => {
    const { language, changeLanguage, t } = useLanguage();
    const { configs, saveConfigs, loadConfigs } = useConfigs();
    const exportHook = useDBExport()
    const { RecordTypes } = useDataStore()
    const { colors } = useTheme()
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

    return (
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='lg'>
                <AppText variant='title'>{t('settings.header')}</AppText>
                <TextField
                    label={t('settings.search')}
                    value={search}
                    onChangeText={setSearch}
                    placeholder={t('settings.search')}
                />

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

                <SettingsSection
                    title={t('settings.sections.records')}
                    description={t('settings.sections.recordsDescription')}
                    keywords={['records', 'record type', 'credit', 'registros', 'crédito']}
                    search={search}
                >
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
                </SettingsSection>

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

                <SettingsSection
                    title={t('settings.sections.savings')}
                    description={t('settings.sections.savingsDescription')}
                    keywords={['savings', 'ahorros', 'trophy', 'trofeo', 'record']}
                    search={search}
                >
                    <SavingsSettingsPanel />
                </SettingsSection>

                <SettingsSection
                    title={t('settings.sections.vehicle')}
                    description={t('settings.sections.vehicleDescription')}
                    keywords={['vehicle', 'vehículo', 'fuel', 'combustible', 'maintenance']}
                    search={search}
                >
                    <VehicleSettingsPanel />
                </SettingsSection>

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
