import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import colorsJson from "@/src/colors/colors.json"; // Asegúrate de la ruta correcta

const useColors = () => {
  const [colors, setColors] = useState<{ [key: string]: string } | null>(null);

  useEffect(() => {
    const loadColors = async () => {
      const storedColors = await AsyncStorage.getItem("colors");
      if (storedColors) {
        setColors(JSON.parse(storedColors));
      } else {
        // Cargar colores por defecto del archivo JSON
        setColors(colorsJson);
      }
    };

    loadColors();
  }, []);

  const saveColors = async (newColors: { [key: string]: string }) => {
    setColors(newColors);
    await AsyncStorage.setItem("colors", JSON.stringify(newColors));
  };

  return { colors, saveColors };
};

export default useColors;
