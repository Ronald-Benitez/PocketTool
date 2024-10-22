import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colorsJson from "@/src/colors/colors.json";
import { ColorScheme } from "../interfaces";

interface ColorsState {
  colors: ColorScheme | null;
  saveColors: (newColors: ColorScheme) => Promise<void>;
  initializeColors: () => Promise<void>;
  resetColors: () => Promise<void>;
}

const useColorStore = create<ColorsState>()((set) => ({
  colors: null,
  initializeColors: async () => {
    const storedColors = await AsyncStorage.getItem("colors");
    if (storedColors) {
      const parsedColors = JSON.parse(storedColors);

      const updatedColors = { ...parsedColors };

      for (const key of Object.keys(colorsJson) as Array<keyof ColorScheme>) {
        if (!(key in updatedColors)) {
          updatedColors[key] = colorsJson[key];
        }
      }
      if (JSON.stringify(updatedColors) !== storedColors) {
        await AsyncStorage.setItem("colors", JSON.stringify(updatedColors));
        set({ colors: updatedColors });
      } else {
        set({ colors: parsedColors });
      }
    } else {
      await AsyncStorage.setItem("colors", JSON.stringify(colorsJson));
      set({ colors: colorsJson });
    }
  },
  saveColors: async (newColors: ColorScheme) => {
    set({ colors: newColors });
    await AsyncStorage.setItem("colors", JSON.stringify(newColors));
  },
  resetColors: async () => {
    await AsyncStorage.setItem("colors", JSON.stringify(colorsJson));
    set({ colors: colorsJson });
  },
}));

export default useColorStore;
