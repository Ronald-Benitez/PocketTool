import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { useLanguage } from '@/src/lang/LanguageContext';
import BaseSelect from '@/src/components/ui/base-select';
import styles from '@/src/styles/styles';
import SwipeItem from '@/src/components/ui/swipe-item';
import useColorStore from '@/src/stores/ColorsStore';
import BorderLeftBlock from '@/src/components/ui/BorderLeftBlock';
import IconButton from '@/src/components/ui/icon-button';
import ModalContainer from '@/src/components/ui/modal-container';
import { MaterialIcons } from '@expo/vector-icons';
import InputLabel from '@/src/components/ui/InputLabel';
import useAndroidToast from '@/src/hooks/useAndroidToast';
import { useHandler } from '@/src/db/handlers/handler';
import { PaymentTypes, PaymentMethods } from '@/src/db/types/tables';
import { useDataStore, PaymentMethodsJoined } from '@/src/stores';

const PaymentMethodsScreen = () => {
    const { t } = useLanguage();
    const [methodName, setMethodName] = useState('');
    const [editingId, setEditingId] = useState<number | undefined>(undefined);
    const [type, setType] = useState<PaymentTypes | null>(null);
    const [closingDate, setClosingDate] = useState(0)
    const [openModal, setOpenModal] = useState(false)
    const { colors } = useColorStore();
    const toast = useAndroidToast()
    const handler = useHandler("PaymentMethods");
    const { PaymentMethods, setPaymentMethods, PaymentTypes, setPaymentTypes } = useDataStore();

    useEffect(() => {
        const loadData = async () => {
            const data = await handler.fetchAllWithJoin('PaymentTypes', "payment_type_id") as PaymentMethodsJoined[];
            setPaymentMethods(data);
            const types = await handler.fetchAll("PaymentTypes") as PaymentTypes[];
            setPaymentTypes(types);
        };

        loadData();
    }, []);

    const handleAddPaymentMethod = async () => {
        if (!methodName || !type || closingDate < 0 || closingDate > 31) {
            toast.emptyMessage()
            return;
        }
        const newPaymentMethod: PaymentMethods = { method_name: methodName, payment_type_id: type?.id, closing_date: closingDate };
        try {
            if (editingId) {
                newPaymentMethod.id = editingId;
                await handler.edit(newPaymentMethod);
                toast.editedMessage()
            } else {
                await handler.add(newPaymentMethod);
                toast.addedMessage()
            }
            const data = await handler.fetchAllWithJoin('PaymentTypes', "payment_type_id") as PaymentMethodsJoined[];
            setPaymentMethods(data);
            setMethodName('');
            setType(null);
            setClosingDate(0)
            setEditingId(undefined);
        } catch (error) {
            toast.errorMessage()
            console.error(error);
        }
    };

    const handleDeletePaymentMethod = async (id: number | undefined) => {
        if (!id) return;
        try {
            await handler.deleteById(id);
            const data = await handler.fetchAllWithJoin('PaymentTypes', "payment_type_id") as PaymentMethodsJoined[];

            toast.deletedMessage()
            setPaymentMethods(data);
        } catch (error) {
            console.error(error);
            toast.errorMessage()
        }
    };

    const handleEditPaymentMethod = (method: PaymentMethods) => {
        setMethodName(method.method_name);
        setType(
            PaymentTypes.find(pt => pt.id === method.payment_type_id) || null
        ); // Establecer el tipo al editar
        setEditingId(method.id);
        setClosingDate(method.closing_date | 0)
        setOpenModal(!openModal)
    };

    const handleCutOffDay = (value: string) => {
        const val = Number(value)
        if (val < 0 || val > 31 || isNaN(val)) {
            return
        }
        setClosingDate(val)
    }

    const buttonOpen = (
        <View style={localStyles.buttonOpenContainer}>
            <IconButton isButton={false}>
                <MaterialIcons name='add' size={20}></MaterialIcons>
            </IconButton >
        </View>
    )

    const onPaymentTypeChange = (index: number) => {
        if (!PaymentTypes) return
        setType(PaymentTypes[index])
    }

    const SelectBlockRender = (index: number) => {
        return (
            <BorderLeftBlock color={PaymentTypes[index].payment_color}>
                <Text style={[styles.text]}>{PaymentTypes[index].payment_type_name}</Text>
            </BorderLeftBlock>
        )
    }

    return (
        <View style={[styles.container, { flex: 1 }]}>
            <ModalContainer
                buttonOpen={buttonOpen}
                title={editingId ? t('paymentMethods.updateMethod') : t('paymentMethods.addMethod')}
                type='complete'
                onAccept={handleAddPaymentMethod}
                closeOnAccept={true}
                open={openModal}>
                <View style={localStyles.modalContent}>
                    <InputLabel
                        placeholder={t('paymentMethods.methodName') + "*"}
                        value={methodName}
                        onChangeText={setMethodName}
                    />
                    <BaseSelect
                        label={t('paymentMethods.type.label') + "*"}
                        selected={type?.payment_type_name}
                        onChange={onPaymentTypeChange}
                        options={PaymentTypes.map(pt => pt.payment_type_name)}
                        title={t('paymentMethods.type.label')}
                        render={SelectBlockRender}
                    />

                    <InputLabel
                        placeholder={t('paymentMethods.closingDate') + "*"}
                        value={String(closingDate)}
                        onChangeText={handleCutOffDay}
                        keyboardType='numeric'
                    />
                    {/* )
                    } */}
                </View>
            </ModalContainer>
            <ScrollView style={{ flex: 1, paddingRight: 40 }}>
                {PaymentMethods?.map((item, index) => (
                    <SwipeItem
                        key={index}
                        handleDelete={() => handleDeletePaymentMethod(item.id)}
                        handleUpdate={() => handleEditPaymentMethod(item)}
                        style={[styles.horizontalBlock]}
                    >
                        <BorderLeftBlock color={item?.payment_color}>
                            <Text style={[styles.text]}>{item.method_name}</Text>
                        </BorderLeftBlock>
                    </SwipeItem>
                ))}
            </ScrollView>
        </View >
    );
};

const localStyles = StyleSheet.create({
    buttonOpenContainer: {
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
    },
    modalContent: {
        paddingTop: 40,
        flexDirection: "column",
        justifyContent: "center",
        gap: 60,
        alignItems: "center",
        height: "90%"
    }
})

export default PaymentMethodsScreen;
