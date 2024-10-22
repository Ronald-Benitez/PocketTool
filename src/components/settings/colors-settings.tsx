import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScrollView } from 'react-native-gesture-handler';

import colorsJson from "@/src/colors/colors.json";
import { useLanguage } from '@/src/lang/LanguageContext';
import useColorStore from '@/src/stores/ColorsStore';
import ColorPicker2 from '../ui/color-picker-2';
import ModalButton from '../ui/modal-button';
import Confirm from '../ui/confirm';
import ConfirmModal from '../ui/confirm-modal';

interface ColorsInterface {
  expenseColor: string,
  incomeColor: string,
  goalColor: string,
  creditColor: string,
  debitColor: string,
}

const ColorSettings = () => {
  const [colors, setColors] = useState(colorsJson);

  const { t } = useLanguage()
  const { saveColors, resetColors } = useColorStore()

  useEffect(() => {
    // Cargar colores desde AsyncStorage
    loadColors();
  }, []);

  useEffect(() => {
    saveColors(colors);
  }, [colors]);

  const handleColorChange = (color: string, key: string) => {
    if (key) {
      setColors((prevColors) => ({ ...prevColors, [key]: color }));
    }
  };

  const reset = async () => {
    await resetColors()
    loadColors()
  }

  const loadColors = async () => {
    try {
      // await AsyncStorage.removeItem('colors')
      const storedColors = await AsyncStorage.getItem('colors');
      if (storedColors) {
        setColors(JSON.parse(storedColors));
      }
    } catch (error) {
      console.error('Error loading colors', error);
    }
  };


  return (
    <View>
      <ScrollView style={{ maxHeight: 600 }}>
        <View style={{ gap: 10 }}>
          {Object.entries(colors).map(([key, color]) => (
            <View key={key} style={[localStyles.colorBlock]}>
              <Text style={localStyles.colorText}>{t(`colors.${key}`)} </Text>
              <ColorPicker2 color={color} onChange={(c) => handleColorChange(c, key)} />
            </View>
          ))}
        </View>
        <View style={{ justifyContent: "center", flexDirection: "row", padding: 10 }}>
          {/* <Confirm message='' onConfirm={reset} title=''>
            <ModalButton onClick={() => {}} text={t("colors.reset")} type='bg' />
          </Confirm> */}
          <ConfirmModal message={t("colors.confirmMessage")} title={t("colors.reset")} onConfirm={reset}>
            <ModalButton isButton={false} text={t("colors.reset")} type='bg' />
          </ConfirmModal>
        </View>
      </ScrollView >
    </View >
  );
};

const localStyles = StyleSheet.create({
  colorText: {
    fontSize: 14,
    fontWeight: "300"
  },
  colorBlock: {
    backgroundColor: "#F9F9F9",
    height: 60,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    alignItems: "center"
  }
})

export default ColorSettings;
