import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colorsJson from "@/src/colors/colors.json";
import colorsDarkJson from "@/src/colors/colorsDark.json";
import { ColorScheme } from "../interfaces";

interface ColorsState {
  colors: ColorScheme | null;
  saveColors: (newColors: ColorScheme) => Promise<void>;
  initializeColors: () => Promise<void>;
  resetColors: () => Promise<void>;
  mode: string;
  setMode: () => Promise<void>;
}

const useColorStore = create<ColorsState>()((set, get) => ({
  colors: null,
  mode: "0",

  initializeColors: async () => {
    const actualMode = await AsyncStorage.getItem("mode") || "0"; // Asegurarse de un valor por defecto
    const isDarkMode = actualMode === "1"; // Comparar como cadena
    const colorsName = isDarkMode ? "colorsDark" : "colors";
    const defaultColors = isDarkMode ? colorsDarkJson : colorsJson;

    const storedColors = await AsyncStorage.getItem(colorsName);
    console.log("initializeColors -> storedColors:", storedColors, "colorsName:", colorsName);

    if (storedColors) {
      const parsedColors = JSON.parse(storedColors);
      const updatedColors = { ...parsedColors };

      for (const key of Object.keys(defaultColors) as Array<keyof ColorScheme>) {
        if (!(key in updatedColors)) {
          updatedColors[key] = defaultColors[key];
        }
      }

      if (JSON.stringify(updatedColors) !== storedColors) {
        await AsyncStorage.setItem(colorsName, JSON.stringify(updatedColors));
        set({ colors: updatedColors });
      } else {
        set({ colors: parsedColors });
      }
    } else {
      await AsyncStorage.setItem(colorsName, JSON.stringify(defaultColors));
      set({ colors: defaultColors });
    }
  },

  saveColors: async (newColors: ColorScheme) => {
    const actualMode = await AsyncStorage.getItem("mode") || "0";
    const colorsName = actualMode === "1" ? "colorsDark" : "colors";
    set({ colors: newColors });
    await AsyncStorage.setItem(colorsName, JSON.stringify(newColors));
  },

  resetColors: async () => {
    const actualMode = await AsyncStorage.getItem("mode") || "0";
    const isDarkMode = actualMode === "1";
    const colorsName = isDarkMode ? "colorsDark" : "colors";
    const defaultColors = isDarkMode ? colorsDarkJson : colorsJson;

    console.log("resetColors -> colorsName:", colorsName);

    await AsyncStorage.setItem(colorsName, JSON.stringify(defaultColors));
    set({ colors: defaultColors });
  },

  setMode: async () => {
    const currentMode = await AsyncStorage.getItem("mode") || "0";
    const newMode = currentMode === "1" ? "0" : "1";

    await AsyncStorage.setItem("mode", newMode);
    set({ mode: newMode });

    // Reiniciar colores para el nuevo modo
    console.log("setMode -> newMode:", newMode);
    await get().initializeColors();
  },
}));


export default useColorStore;
