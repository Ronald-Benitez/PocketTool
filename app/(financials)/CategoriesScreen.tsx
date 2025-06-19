import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';

import styles from '@/src/styles/styles';
import { useLanguage } from '@/src/lang/LanguageContext';
import SwipeItem from '@/src/components/ui/swipe-item';
import BGSimpleBlock from '@/src/components/ui/BGSimpleBlock';
import IconButton from '@/src/components/ui/icon-button';
import { MaterialIcons } from '@expo/vector-icons';
import InputLabel from '@/src/components/ui/InputLabel';
import useAndroidToast from '@/src/hooks/useAndroidToast';
import { useHandler } from '@/src/db/handlers/handler';
import { Categories } from '@/src/db/types/tables';
import { useDataStore } from '@/src/stores';

const PaymentTypesScreen = () => {
    const { t } = useLanguage();
    const [category_name, setCategoryName ] = useState('');
    const [editingId, setEditingId] = useState<number | undefined>(undefined);
    const handler = useHandler("Categories");
    const {Categories, setCategories} = useDataStore()
    const toast = useAndroidToast()

    useEffect(() => {
        const loadData = async () => {
            const result = await handler.fetchAll() as Categories[];
            setCategories(result);
        };
        loadData();
    }, []);

    const handleAddOrUpdate = async () => {
        if (!category_name) {
            toast.emptyMessage()
            return;
        }
        const newData: Categories = { category_name }; 

        try {
            if (editingId) {
                newData.id = editingId
                await handler.edit(newData);
                toast.editedMessage()
            } else {
                await handler.add(newData);
                toast.addedMessage()
            }

            const result = await handler.fetchAll();
            setCategories(result as Categories[]);
            setCategoryName('');
            setEditingId(undefined);
        } catch (error) {
            console.error(error);
            toast.errorMessage()
        }
    };

    const handleEdit = (data: Categories) => {
        setCategoryName(data.category_name);
        setEditingId(data.id);
    };

    const handleDelete = async (id: number | undefined) => {
        if(!id) return;
        try {
            await handler.deleteById(id);
            const result = await handler.fetchAll() as Categories[];
            setCategories(result);
            toast.deletedMessage();
        } catch (error) {
            console.error(error);
        }
    };
    return (
        <View style={styles.container}>
            <View style={localStyles.rowContainer}>
                <InputLabel
                    placeholder={t('categories.categoryName') + '*'}
                    value={category_name}
                    onChangeText={setCategoryName}
                />
                <IconButton onClick={handleAddOrUpdate}>
                    <MaterialIcons name={editingId ? 'edit' : 'add'} size={20}></MaterialIcons>
                </IconButton>
            </View>
            <ScrollView style={{ flex: 1, paddingRight: 40 }}>
                {Categories?.map((item, index) => (
                    <View key={index} style={{ marginVertical: 5 }}>
                        <SwipeItem
                            handleDelete={() => handleDelete(item.id)}
                            handleUpdate={() => handleEdit(item)}
                            style={[styles.horizontalBlock]}
                        >
                            <BGSimpleBlock>
                                <Text>{item.category_name}</Text>
                            </BGSimpleBlock>
                        </SwipeItem>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const localStyles = StyleSheet.create({
    label: {
        fontSize: 12,
        fontWeight: "200"
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: 10
    },
    colContainer: {
        flex: 1,
        flexDirection: "column"
    },
})

export default PaymentTypesScreen;
