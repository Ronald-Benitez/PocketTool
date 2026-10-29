import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import { SwipeAction } from '@/src/ui/actions/SwipeAction';
import useAndroidToast from '@/src/hooks/useAndroidToast';
import { Category } from '@/src/interfaces/schema';
import { useDataStore } from '@/src/stores';
import { useTableRepository } from '@/src/db';
import { Button } from '@/src/ui/actions/Button';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { TextField } from '@/src/ui/forms/TextField';
import { Modal } from '@/src/ui/overlays/Modal';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

const CategoriesScreen = () => {
    const { t } = useLanguage();
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const [category_name, setCategoryName] = useState('');
    const [editingId, setEditingId] = useState<number | undefined>(undefined);
    const { Categories, setCategories } = useDataStore()
    const toast = useAndroidToast()
    const repository = useTableRepository("Categories");

    useEffect(() => {
        const loadData = async () => {
            const result = await repository.fetchAll();
            setCategories(result);
        };
        loadData();
    }, []);

    const resetForm = () => {
        setCategoryName('');
        setEditingId(undefined);
    }

    const openCreate = () => {
        resetForm();
        setVisible(true);
    }

    const handleAddOrUpdate = async () => {
        if (!category_name.trim()) {
            toast.emptyMessage()
            return;
        }
        const newData: Category = { category_name: category_name.trim() };

        try {
            if (editingId) {
                await repository.edit({ ...newData, id: editingId });
                toast.editedMessage()
            } else {
                await repository.add(newData);
                toast.addedMessage()
            }

            const result = await repository.fetchAll();
            setCategories(result);
            resetForm();
            setVisible(false);
        } catch (error) {
            console.error(error);
            toast.errorMessage()
        }
    };

    const handleEdit = (data: Category) => {
        setCategoryName(data.category_name);
        setEditingId(data.id);
        setVisible(true);
    };

    const handleDelete = async (id: number | undefined) => {
        if (!id) return;
        try {
            await repository.deleteById(id);
            const result = await repository.fetchAll();
            setCategories(result);
            toast.deletedMessage();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='lg'>
                <Row justify='flex-start'>
                    <Button
                        label={t('add.category')}
                        size='sm'
                        onPress={openCreate}
                        leftIcon={
                            <MaterialIcons
                                name='add'
                                size={18}
                                color={colors.onPrimary}
                            />
                        }
                    />
                </Row>

                <View style={{ gap: 8 }}>
                    {Categories?.map((item, index) => (
                        <SwipeAction
                            key={item.id ?? index}
                            handleDelete={() => handleDelete(item.id)}
                            handleUpdate={() => handleEdit(item)}
                        >
                            <ListItem
                                title={item.category_name}
                                showDivider
                            />
                        </SwipeAction>
                    ))}
                </View>
            </Stack>

            <Modal
                visible={visible}
                onClose={() => setVisible(false)}
                title={editingId ? t('edit.category') : t('add.category')}
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
                            onPress={handleAddOrUpdate}
                            style={{ flex: 1 }}
                        />
                    </Row>
                }
            >
                <TextField
                    label={t('categories.categoryName')}
                    required
                    placeholder={t('categories.categoryName')}
                    value={category_name}
                    onChangeText={setCategoryName}
                />
            </Modal>
        </Screen>
    );
};

export default CategoriesScreen;
