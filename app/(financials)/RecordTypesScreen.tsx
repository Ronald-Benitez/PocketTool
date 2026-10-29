import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { useLanguage } from '@/src/lang/LanguageContext';
import SwipeItem from '@/src/components/ui/swipe-item';
import useAndroidToast from '@/src/hooks/useAndroidToast';
import { RecordType, Insertable } from '@/src/interfaces/schema';
import { useDataStore } from '@/src/stores';
import { useTableRepository } from '@/src/db';
import { Button } from '@/src/ui/actions/Button';
import { ColorField } from '@/src/ui/forms/ColorField';
import { SelectField } from '@/src/ui/forms/SelectField';
import { TextField } from '@/src/ui/forms/TextField';
import { ListItem } from '@/src/ui/data-display/ListItem';
import { Modal } from '@/src/ui/overlays/Modal';
import { Row, Stack } from '@/src/ui/primitives/Stack';
import { Screen } from '@/src/ui/primitives/Screen';
import { useTheme } from '@/src/ui/theme/ThemeProvider';

type EffectType = "-" | "=" | "+";

const RecordTypesScreen = () => {
    const { t } = useLanguage();
    const { colors } = useTheme();
    const [visible, setVisible] = useState(false);
    const [name, setName] = useState('');
    const [color, setColor] = useState('#000000');
    const [effect, setEffect] = useState<EffectType>('=');
    const [editingId, setEditingId] = useState<number | undefined>(undefined);
    const toast = useAndroidToast()
    const { RecordTypes, setRecordTypes } = useDataStore();
    const repository = useTableRepository("RecordTypes");

    useEffect(() => {
        const loadData = async () => {
            const ormData = await repository.fetchAll();
            setRecordTypes(ormData);
        };
        loadData();
    }, []);

    const resetForm = () => {
        setName('');
        setColor('#000000');
        setEffect('=');
        setEditingId(undefined);
    }

    const openCreate = () => {
        resetForm();
        setVisible(true);
    }

    const handleAdd = async () => {
        if (!name.trim() || !color || effect === null) {
            toast.emptyMessage()
            return;
        }
        const newData: Insertable<RecordType> = {
            type_name: name.trim(),
            effect,
            record_color: color,
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
            setRecordTypes(methods);
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
            setRecordTypes(methods);
        } catch (error) {
            console.error(error);
            toast.errorMessage()
        }
    };

    const handleEdit = (item: RecordType) => {
        setName(item.type_name);
        setColor(item.record_color || "#000000");
        setEffect((item.effect as EffectType) || '=');
        setEditingId(item.id);
        setVisible(true)
    };

    const effectOptions: { label: string; value: EffectType }[] = [
        { label: t('item.expense'), value: '-' },
        { label: t('item.transfer'), value: '=' },
        { label: t('item.income'), value: '+' },
    ];

    return (
        <Screen scroll edges={['left', 'right']}>
            <Stack gap='lg'>
                <Button
                    label={t('add.recordType')}
                    size='sm'
                    onPress={openCreate}
                    leftIcon={<MaterialIcons name='add' size={18} color={colors.onPrimary} />}
                    style={{ alignSelf: 'flex-start' }}
                />

                <View style={{ gap: 8 }}>
                    {RecordTypes?.map((item, index) => (
                        <SwipeItem
                            key={item.id ?? index}
                            handleDelete={() => handleDelete(item.id)}
                            handleUpdate={() => handleEdit(item)}
                        >
                            <ListItem
                                title={item.type_name}
                                leading={
                                    <View
                                        style={{
                                            width: 4,
                                            height: 32,
                                            borderRadius: 2,
                                            backgroundColor: item.record_color || colors.primary,
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
                title={editingId ? t('edit.recordType') : t('add.recordType')}
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
                        label={t('recordTypes.name')}
                        required
                        value={name}
                        onChangeText={setName}
                        placeholder={t('recordTypes.name')}
                    />
                    <SelectField<EffectType>
                        label={t('recordTypes.effect')}
                        required
                        value={effect}
                        options={effectOptions}
                        onChange={setEffect}
                        title={t('recordTypes.effect')}
                        closeLabel={t('cancel')}
                    />
                    <ColorField
                        label={t('recordTypes.color')}
                        required
                        value={color}
                        onChange={setColor}
                    />
                </Stack>
            </Modal>
        </Screen>
    );
};

export default RecordTypesScreen;
