import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Alert, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';

import { useLanguage } from '@/src/lang/LanguageContext';
import { PaymentMethod, CreatePaymentMethodRequest } from '@/src/interfaces';
import { usePaymentMethods } from '@/src/db';
import styles from '@/src/styles/styles';
import SwipeItem from '@/src/components/ui/swipe-item';
import Dropdown from '@/src/components/ui/dropdown';
import usePaymentsStore from '@/src/stores/PaymentMethodsStore';
import useColorStore from '@/src/stores/ColorsStore';
import BGSimpleBlock from '@/src/components/ui/BGSimpleBlock';
import BorderLeftBlock from '@/src/components/ui/BorderLeftBlock';
import IconButton from '@/src/components/ui/icon-button';
import ModalContainer from '@/src/components/ui/modal-container';
import { MaterialIcons } from '@expo/vector-icons';
import Input from '@/src/components/ui/Input';
import InputLabel from '@/src/components/ui/InputLabel';
import PressableSwitch from '@/src/components/ui/pressable-switch';

const PaymentMethodsScreen = () => {
    const { t } = useLanguage();
    const [methodName, setMethodName] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [type, setType] = useState<'credit' | 'debit'>('credit');
    const { addPaymentMethod, deletePaymentMethod, fetchPaymentMethods, updatePaymentMethod } = usePaymentMethods();
    const { payments, setPayments } = usePaymentsStore();
    const [openModal, setOpenModal] = useState(false)
    const { colors } = useColorStore();

    useEffect(() => {
        const loadPaymentMethods = async () => {
            const methods = await fetchPaymentMethods();
            setPayments(methods);
        };

        loadPaymentMethods();
    }, []);

    const handleAddPaymentMethod = async () => {
        if (!methodName) {
            Alert.alert(t('paymentMethods.error.emptyFields'));
            return;
        }
        const newPaymentMethod: CreatePaymentMethodRequest = { method_name: methodName, payment_type: type };
        try {
            if (editingId) {
                await updatePaymentMethod(editingId, methodName, type);
            } else {
                await addPaymentMethod(newPaymentMethod);
            }
            const methods = await fetchPaymentMethods();
            setPayments(methods);
            setMethodName('');
            setType('credit'); // Resetear al agregar o editar
            setEditingId(null);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeletePaymentMethod = async (id: number) => {
        try {
            await deletePaymentMethod(id);
            const methods = await fetchPaymentMethods();
            setPayments(methods);
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditPaymentMethod = (method: PaymentMethod) => {
        setMethodName(method.method_name);
        setType(method.payment_type); // Establecer el tipo al editar
        setEditingId(method.id);
        setOpenModal(!openModal)
    };

    const handleType = () => {
        if (type == 'credit') setType("debit")
        else setType("credit")
    }

    const buttonOpen = (
        <View style={localStyles.buttonOpenContainer}>
            <IconButton isButton={false}>
                <MaterialIcons name='add' size={20}></MaterialIcons>
            </IconButton >
        </View>
    )

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
                        placeholder={t('paymentMethods.methodName')}
                        value={methodName}
                        onChangeText={setMethodName}
                    />
                    <PressableSwitch
                        onClick={handleType}
                        text={t(`paymentMethods.type.${type}`)}
                        label={t('paymentMethods.type.label')}
                        textColor={type == "credit" ? colors?.Credit : colors?.Debit}
                    />
                </View>
            </ModalContainer>
            <ScrollView style={{ flex: 1, paddingRight: 40 }}>
                {payments?.map((item, index) => (
                    <SwipeItem
                        key={index}
                        handleDelete={() => handleDeletePaymentMethod(item.id)}
                        handleUpdate={() => handleEditPaymentMethod(item)}
                        style={[styles.horizontalBlock]}
                    >
                        <BorderLeftBlock color={colors?.[item.payment_type === 'credit' ? 'Credit' : 'Debit']}>
                            <Text>{item.method_name} ({t(item.payment_type)})</Text>
                        </BorderLeftBlock>
                    </SwipeItem>
                ))}
            </ScrollView>
        </View >
    );
};

const localStyles = StyleSheet.create({
    buttonOpenContainer: {
        flexDirection: "row",
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
