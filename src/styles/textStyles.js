
import { StyleSheet } from 'react-native';
import fontFamily from './fontFamily';

const createTextStyles = (colors, fontSize = 16) =>
  StyleSheet.create({
    title: {
      ...fontFamily.MerriweatherVariable,
      fontSize: Math.min(fontSize + 8, 24),
      fontWeight: '400', // Bold weight for variable font
      color: colors.text,
    },
    word: {
      ...fontFamily.MerriweatherVariable,
      fontSize: fontSize + 4,
      fontWeight: '700',
      color: colors.text,
    },
    definition: {
      ...fontFamily.MerriweatherVariable,
      fontSize: fontSize,
      fontWeight: '400', // Regular weight
      lineHeight: Math.max(fontSize * 1.6, 24),
      color: colors.text,
    },
    example: {
      ...fontFamily.MerriweatherVariable,
      fontSize: 14,
      fontStyle: 'italic', // Italic style (variable font may support this)
      color: colors.text,
    },
  });

export default createTextStyles;
