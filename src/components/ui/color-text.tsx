import React from 'react';
import { Text, TextStyle } from 'react-native';

interface ColorTextProps {
  children: React.ReactNode;
  backgroundColor?: string; // Color en formato hexadecimal (#RGB, #RRGGBB, o #RRGGBBAA)
  fontSize?: number;
  fontWeight?: TextStyle['fontWeight'];
  textAlign?: TextStyle['textAlign'];
}

const ColorText: React.FC<ColorTextProps> = ({
  children,
  backgroundColor,
  fontSize = 14,
  fontWeight = 'normal',
  textAlign = 'left',
}) => {
  // Convertir hex a RGB
  const hexToRgb = (hex: string) => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) { // #RGB
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) { // #RRGGBB
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    } else if (hex.length === 9) { // #RRGGBBAA
      r = parseInt(hex.slice(1, 3), 16);
      g = parseInt(hex.slice(3, 5), 16);
      b = parseInt(hex.slice(5, 7), 16);
    }
    return { r, g, b };
  };

  // Calcular si el texto debe ser claro u oscuro
  const { r, g, b } = hexToRgb(backgroundColor || "#fff");
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  const textColor = brightness > 128 ? '#000000' : '#FFFFFF';

  return (
    <Text
      style={{
        color: textColor,
        fontSize,
        fontWeight,
        textAlign,
        padding: 8,
        borderRadius: 4,
      }}
    >
      {children}
    </Text>
  );
};

export default ColorText;
