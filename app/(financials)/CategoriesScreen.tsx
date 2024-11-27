import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView } from 'react-native';

import styles from '@/src/styles/styles';
import { useLanguage } from '@/src/lang/LanguageContext';
import { Category, CreateCategoryRequest } from '@/src/interfaces';
import { useCategories } from '@/src/db';
import SwipeItem from '@/src/components/ui/swipe-item';
import useCategoriesStore from '@/src/stores/CategoriesStore';
import BGSimpleBlock from '@/src/components/ui/BGSimpleBlock';
import IconButton from '@/src/components/ui/icon-button';
import { MaterialIcons } from '@expo/vector-icons';
import InputLabel from '@/src/components/ui/InputLabel';
import useAndroidToast from '@/src/hooks/useAndroidToast';

const CategoriesScreen = () => {
    const { t } = useLanguage();
    const [categoryName, setCategoryName] = useState('');
    // const [categories, setCategories] = useState<Category[]>([]);
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const { addCategory, deleteCategory, fetchCategories, updateCategory } = useCategories()
    const { categories, setCategories } = useCategoriesStore()
    const toast = useAndroidToast()

    useEffect(() => {
        const loadCategories = async () => {
            const result = await fetchCategories();
            setCategories(result);
        };
        loadCategories();
    }, []);

    const handleAddOrUpdateCategory = async () => {
        if (!categoryName) {
            toast.emptyMessage()
            return;
        }
        const category: CreateCategoryRequest = { category_name: categoryName };

        try {
            if (editingCategoryId) {
                await updateCategory(editingCategoryId, category);
                toast.editedMessage()
            } else {
                await addCategory(category);
                toast.addedMessage()
            }

            const result = await fetchCategories();
            setCategories(result);
            setCategoryName('');
            setEditingCategoryId(null);
        } catch (error) {
            console.error(error);
            toast.errorMessage()
        }
    };

    const handleEditCategory = (category: Category) => {
        setCategoryName(category.category_name);
        setEditingCategoryId(category.id);
    };

    const handleDeleteCategory = async (id: number) => {
        try {
            await deleteCategory(id);
            const result = await fetchCategories();
            setCategories(result);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            {/* <Text style={styles.header}>{t('categories.header')}</Text> */}
            <View style={localStyles.rowContainer}>
                <InputLabel
                    placeholder={t('categories.categoryName') + '*'}
                    value={categoryName}
                    onChangeText={setCategoryName}
                />
                <IconButton onClick={handleAddOrUpdateCategory}>
                    <MaterialIcons name={editingCategoryId ? 'edit' : 'add'} size={20}></MaterialIcons>
                </IconButton>
            </View>
            <ScrollView style={{ flex: 1, paddingRight: 40 }}>
                {categories?.map((item, index) => (
                    <View key={index} style={{ marginVertical: 5 }}>
                        <SwipeItem
                            handleDelete={() => handleDeleteCategory(item.id)}
                            handleUpdate={() => handleEditCategory(item)}
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

export default CategoriesScreen;
