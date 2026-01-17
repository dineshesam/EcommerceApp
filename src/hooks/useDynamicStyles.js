// import { useTheme } from '@react-navigation/native';

// const useDynamicStyles = () => {
//   const { colors } = useTheme();
//   return { colors };
// };

// export default useDynamicStyles;

import { useTheme } from '@react-navigation/native';
import createTextStyles from '../styles/textStyles';
import { getThemeImages } from '../assets/themeImages';

const useDynamicStyles = () => {
  const { colors, dark } = useTheme();
  const textStyles = createTextStyles(colors);
  const img = getThemeImages(dark);

  return { textStyles, colors, img };
};

export default useDynamicStyles;
