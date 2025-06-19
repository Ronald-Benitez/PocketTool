import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

import { useLanguage } from '@/src/lang/LanguageContext';
import styles from '@/src/styles/styles';
import SwipeItem from '@/src/components/ui/swipe-item';
import BorderLeftBlock from '@/src/components/ui/BorderLeftBlock';
import IconButton from '@/src/components/ui/icon-button';
import ModalContainer from '@/src/components/ui/modal-container';
import { MaterialIcons } from '@expo/vector-icons';
import InputLabel from '@/src/components/ui/InputLabel';
import useAndroidToast from '@/src/hooks/useAndroidToast';
import { useHandler } from '@/src/db/handlers/handler';
import { PaymentTypes, RecordTypes } from '@/src/db/types/tables';
import { useDataStore } from '@/src/stores';
import ColorPicker2 from '@/src/components/ui/color-picker-2';

type EffectType = "-" | "=" | "+";

const RecordTypesScreen = () => {
    const { t } = useLanguage();
    const [name, setName] = useState('');
    const [color, setColor] = useState('#000000');
    const [effect, setEffect] = useState<EffectType>('=');
    const [editingId, setEditingId] = useState<number | undefined>(undefined);
    const [openModal, setOpenModal] = useState(false)
    const toast = useAndroidToast()
    const handler = useHandler("RecordTypes");
    const { RecordTypes, setRecordTypes } = useDataStore();

    useEffect(() => {
        const loadData = async () => {
            const data = await handler.fetchAll() as RecordTypes[];
            setRecordTypes(data);
        };
        loadData();
    }, []);

    const handleAdd = async () => {
        if (!name || !color || effect === null) {
            toast.emptyMessage()
            return;
        }
        const newData: RecordTypes = { type_name: name, effect, record_color: color };
        try {
            if (editingId) {
                newData.id = editingId;
                await handler.edit(newData);
                toast.editedMessage()
            } else {
                await handler.add(newData);
                toast.addedMessage()
            }
            const methods = await handler.fetchAll() as RecordTypes[];
            setRecordTypes(methods);
            setName('');
            setColor('#000000');
            setEffect('=');
            setEditingId(undefined);
        } catch (error) {
            toast.errorMessage()
            console.error(error);
        }
    };

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        try {
            await handler.deleteById(id);
            const methods = await handler.fetchAll() as RecordTypes[];
            toast.deletedMessage()
            setRecordTypes(methods);
        } catch (error) {
            console.error(error);
            toast.errorMessage()
        }
    };

    const handleEdit = (item: RecordTypes) => {
        setName(item.type_name);
        setColor(item.record_color);
        setEffect(item.effect as EffectType);
        setEditingId(item.id);
        setOpenModal(!openModal)
    };

    const buttonOpen = (
        <View style={localStyles.buttonOpenContainer}>
            <IconButton isButton={false}>
                <MaterialIcons name='add' size={20}></MaterialIcons>
            </IconButton >
        </View>
    )

    const onCloseModal = () => {
        setName('');
        setColor('#000000');
        setEffect('=');
        setEditingId(undefined);
    };

    return (
        <View style={[styles.container, { flex: 1 }]}>
            <ModalContainer
                buttonOpen={buttonOpen}
                title={editingId ? t('edit.recordType') : t('add.recordType')}
                type='complete'
                onAccept={handleAdd}
                closeOnAccept={true}
                open={openModal}
                onClose={onCloseModal}
            >
                <View style={localStyles.modalContent}>
                    <InputLabel
                        placeholder={t('recordTypes.name') + "*"}
                        value={name}
                        onChangeText={setName}
                    />
                    <View style={{ width: '100%', paddingHorizontal: 40, flexDirection: "row", justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[styles.label, { marginBottom: 10 }]}>
                            {t('recordTypes.effect') + "*"}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
                            {['-', '=', '+'].map((eff) => (
                                <Pressable
                                    key={eff}
                                    onPress={() => setEffect(eff as EffectType)}
                                    style={effect === eff ? styles.enfasizedButton : styles.button}
                                >
                                    <Text style={styles.text}>{eff}</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                    <View style={{ width: '100%', paddingHorizontal: 40, flexDirection: "row", justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text style={[styles.label, { marginBottom: 10 }]}>
                            {t('recordTypes.color') + "*"}
                        </Text>

                        <ColorPicker2
                            color={color}
                            onChange={(c) => setColor(c)}
                        />
                    </View>
                </View>
            </ModalContainer>
            <ScrollView style={{ flex: 1, paddingRight: 40 }}>
                {RecordTypes?.map((item, index) => (
                    <SwipeItem
                        key={index}
                        handleDelete={() => handleDelete(item.id)}
                        handleUpdate={() => handleEdit(item)}
                        style={[styles.horizontalBlock]}
                    >
                        <BorderLeftBlock color={item?.record_color}>
                            <Text style={[styles.text]}>{item.type_name}</Text>
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

export default RecordTypesScreen;
