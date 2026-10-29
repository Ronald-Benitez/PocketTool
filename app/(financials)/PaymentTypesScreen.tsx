import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import { SwipeAction } from '@/src/ui/actions/SwipeAction';
import useAndroidToast from '@/src/hooks/useAndroidToast';
import { Insertable, PaymentType } from '@/src/interfaces/schema';
import { useDataStore } from '@/src/stores';
import { useTableRepository } from '@/src/db';
import { Button } from '@/src/ui/actions/Button';
import { ColorField } from '@/src/ui/forms/ColorField';
import { TextField } from '@/src/ui/forms/TextField';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { Modal } from '@/src/ui/overlays/Modal';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const PaymentTypesScreen = () => {
    const { t } = useLanguage();
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#000000');
    const [editingId, setEditingId] = useState<number | undefined>(undefined);
    const toast = useAndroidToast()
    const { PaymentTypes, setPaymentTypes } = useDataStore();
    const repository = useTableRepository("PaymentTypes");

    useEffect(() => {
        const loadData = async () => {
            const data = await repository.fetchAll();
            setPaymentTypes(data);
        };
        loadData();
    }, []);

    const resetForm = () => {
        setName('');
        setColor('#000000');
        setEditingId(undefined);
    }

    const openCreate = () => {
        resetForm();
        setVisible(true);
    }

    const handleAdd = async () => {
        if (!name.trim() || !color) {
            toast.emptyMessage()
            return;
        }
        const newData: Insertable<PaymentType> = {
            payment_type_name: name.trim(),
            payment_color: color,
        };
        try {
            if (editingId) {
                await repository.edit({ ...newData, id: editingId });
                toast.editedMessage()
            } else {
                await repository.add(newData);
                toast.addedMessage()
            }
            const methods = await repository.fetchAll();
            setPaymentTypes(methods);
            resetForm();
            setVisible(false);
        } catch (error) {
            toast.errorMessage()
            console.error(error);
        }
    };

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        try {
            await repository.deleteById(id);
            const methods = await repository.fetchAll();
            toast.deletedMessage()
            setPaymentTypes(methods);
        } catch (error) {
            console.error(error);
            toast.errorMessage()
        }
    };

    const handleEdit = (item: PaymentType) => {
        setName(item.payment_type_name || '');
        setColor(item.payment_color || '#000000');
        setEditingId(item.id);
        setVisible(true)
    };

    return (
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='lg'>
                <Button
                    label={t('add.paymentTypes')}
                    size='sm'
                    onPress={openCreate}
                    leftIcon={<MaterialIcons name='add' size={18} color={colors.onPrimary} />}
                    style={{ alignSelf: 'flex-start' }}
                />

                <View style={{ gap: 8 }}>
                    {PaymentTypes?.map((item, index) => (
                        <SwipeAction
                            key={item.id ?? index}
                            handleDelete={() => handleDelete(item.id)}
                            handleUpdate={() => handleEdit(item)}
                        >
                            <ListItem
                                title={item.payment_type_name || ''}
                                leading={
                                    <View
                                        style={{
                                            width: 4,
                                            height: 32,
                                            borderRadius: 2,
                                            backgroundColor: item.payment_color || colors.primary,
                                        }}
                                    />
                                }
                                showDivider
                            />
                        </SwipeAction>
                    ))}
                </View>
            </Stack>

            <Modal
                visible={visible}
                onClose={() => setVisible(false)}
                title={editingId ? t('edit.paymentTypes') : t('add.paymentTypes')}
                closeLabel={t('cancel')}
                scrollable
                footer={
                    <Row gap='sm' style={{ flex: 1 }}>
                        <Button
                            label={t('cancel')}
                            variant='outline'
                            onPress={() => setVisible(false)}
                            style={{ flex: 1 }}
                        />
                        <Button
                            label={t('confirm')}
                            onPress={handleAdd}
                            style={{ flex: 1 }}
                        />
                    </Row>
                }
            >
                <Stack gap='lg'>
                    <TextField
                        label={t('paymentTypes.name')}
                        required
                        value={name}
                        onChangeText={setName}
                        placeholder={t('paymentTypes.name')}
                    />
                    <ColorField
                        label={t('paymentTypes.color')}
                        required
                        value={color}
                        onChange={setColor}
                    />
                </Stack>
            </Modal>
        </Screen>
    );
};

export default PaymentTypesScreen;
