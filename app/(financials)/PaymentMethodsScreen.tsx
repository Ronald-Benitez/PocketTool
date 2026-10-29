import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import SwipeItem from '@/src/components/ui/swipe-item';
import useAndroidToast from '@/src/hooks/useAndroidToast';
import { PaymentType, PaymentMethod, Insertable } from '@/src/interfaces/schema';
import { useDataStore } from '@/src/stores';
import { usePaymentMethods, useTableRepository } from '@/src/db';
import { Button } from '@/src/ui/actions/Button';
import { ColoredSelectOption } from '@/src/ui/forms/ColoredSelectOption';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { Modal } from '@/src/ui/overlays/Modal';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { useTheme } from '@/src/ui/theme/ThemeProvider';
import type { PaymentType as PaymentTypeEntity } from '@/src/db/schema/generated/types';

const PaymentMethodsScreen = () => {
    const { t } = useLanguage();
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const [methodName, setMethodName] = useState('');
    const [editingId, setEditingId] = useState<number | undefined>(undefined);
    const [type, setType] = useState<PaymentType | null>(null);
    const [closingDate, setClosingDate] = useState(0)
    const [paidDate, setPaidDate] = useState(0)
    const toast = useAndroidToast()
    const { PaymentMethods, setPaymentMethods, PaymentTypes, setPaymentTypes } = useDataStore();
    const {
        fetchPaymentMethods,
        addPaymentMethod,
        updatePaymentMethod,
        deletePaymentMethod,
    } = usePaymentMethods();
    const paymentTypesRepository = useTableRepository('PaymentTypes');

    useEffect(() => {
        const loadData = async () => {
            const ormData = await fetchPaymentMethods();
            setPaymentMethods(ormData);
            const types = await paymentTypesRepository.fetchAll();
            setPaymentTypes(types);
        };

        loadData();
    }, []);

    const resetForm = () => {
        setMethodName('');
        setType(null);
        setClosingDate(0);
        setPaidDate(0);
        setEditingId(undefined);
    }

    const openCreate = () => {
        resetForm();
        setVisible(true);
    }

    const handleAddPaymentMethod = async () => {
        if (!methodName.trim() || !type || closingDate < 0 || closingDate > 31 || paidDate < 0 || paidDate > 31) {
            toast.emptyMessage()
            return;
        }
        const newPaymentMethod: Insertable<PaymentMethod> = {
            method_name: methodName.trim(),
            payment_type_id: type?.id || 1,
            closing_date: closingDate,
            payment_date: paidDate,
        };
        try {
            if (editingId) {
                await updatePaymentMethod(editingId, newPaymentMethod);
                toast.editedMessage()
            } else {
                await addPaymentMethod(newPaymentMethod);
                toast.addedMessage()
            }
            const data = await fetchPaymentMethods();
            setPaymentMethods(data);
            resetForm();
            setVisible(false);
        } catch (error) {
            toast.errorMessage()
            console.error(error);
        }
    };

    const handleDeletePaymentMethod = async (id: number | undefined) => {
        if (!id) return;
        try {
            await deletePaymentMethod(id);
            const data = await fetchPaymentMethods();

            toast.deletedMessage()
            setPaymentMethods(data);
        } catch (error) {
            console.error(error);
            toast.errorMessage()
        }
    };

    const handleEditPaymentMethod = (method: PaymentMethod) => {
        setMethodName(method.method_name);
        setType(PaymentTypes.find(pt => pt.id === method.payment_type_id) || null);
        setEditingId(method.id);
        setClosingDate(method?.closing_date || 0)
        setPaidDate(method?.payment_date || 0)
        setVisible(true)
    };

    const handleDayChange = (setter: (value: number) => void) => (value: string) => {
        const day = Number(value.replace(/[^0-9]/g, ''))
        if (Number.isNaN(day) || day < 0 || day > 31) return
        setter(day)
    }

    const paymentTypes = PaymentTypes ?? []
    const paymentTypeOptions = paymentTypes.flatMap((paymentType: PaymentTypeEntity) =>
        typeof paymentType.id === 'number'
            ? [{ label: paymentType.payment_type_name || '', value: paymentType.id }]
            : []
    )

    const renderTypeOption = (option: { label: string; value: number }) => (
        <ColoredSelectOption
            color={paymentTypes.find((paymentType) => paymentType.id === option.value)?.payment_color}
            label={option.label}
        />
    )

    return (
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='lg'>
                <Row justify='flex-end'>
                    <Button
                        label={t('paymentMethods.addMethod')}
                        size='sm'
                        onPress={openCreate}
                        leftIcon={<MaterialIcons name='add' size={18} color={colors.onPrimary} />}
                    />
                </Row>

                <View style={{ gap: 8 }}>
                    {PaymentMethods?.map((item) => (
                        <SwipeItem
                            key={item.id}
                            handleDelete={() => handleDeletePaymentMethod(item.id)}
                            handleUpdate={() => handleEditPaymentMethod(item)}
                        >
                            <ListItem
                                title={item.method_name}
                                leading={
                                    <View
                                        style={{
                                            width: 4,
                                            height: 32,
                                            borderRadius: 2,
                                            backgroundColor: item?.PaymentTypes?.payment_color || colors.goal,
                                        }}
                                    />
                                }
                                showDivider
                            />
                        </SwipeItem>
                    ))}
                </View>
            </Stack>

            <Modal
                visible={visible}
                onClose={() => setVisible(false)}
                title={editingId ? t('paymentMethods.updateMethod') : t('paymentMethods.addMethod')}
                closeLabel={t('cancel')}
                scrollable
                footer={
                    <View style={{ flex: 1, flexDirection: 'row', gap: 8 }}>
                        <Button
                            label={t('cancel')}
                            variant='outline'
                            onPress={() => setVisible(false)}
                            style={{ flex: 1 }}
                        />
                        <Button
                            label={t('confirm')}
                            onPress={handleAddPaymentMethod}
                            style={{ flex: 1 }}
                        />
                    </View>
                }
            >
                <View style={{ gap: 16 }}>
                    <TextField
                        label={t('paymentMethods.methodName')}
                        required
                        value={methodName}
                        onChangeText={setMethodName}
                        placeholder={t('paymentMethods.methodName')}
                    />
                    <SelectField<number>
                        label={t('paymentMethods.type.label')}
                        required
                        value={type?.id}
                        title={t('paymentMethods.type.label')}
                        placeholder={t('paymentMethods.type.label')}
                        options={paymentTypeOptions}
                        onChange={(id) => setType(paymentTypes.find((paymentType) => paymentType.id === id) || null)}
                        renderOption={renderTypeOption}
                        closeLabel={t('cancel')}
                    />
                    <TextField
                        label={t('paymentMethods.closingDate')}
                        required
                        value={String(closingDate)}
                        onChangeText={handleDayChange(setClosingDate)}
                        keyboardType='number-pad'
                        maxLength={2}
                        placeholder={t('paymentMethods.closingDate')}
                    />
                    <TextField
                        label={t('paymentMethods.paidDate')}
                        required
                        value={String(paidDate)}
                        onChangeText={handleDayChange(setPaidDate)}
                        keyboardType='number-pad'
                        maxLength={2}
                        placeholder={t('paymentMethods.paidDate')}
                    />
                </View>
            </Modal>
        </Screen>
    );
};

export default PaymentMethodsScreen;
