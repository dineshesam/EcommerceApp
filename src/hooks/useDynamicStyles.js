// import { useTheme } from '@react-navigation/native';

// const useDynamicStyles = () => {
//   const { colors } = useTheme();
//   return { colors };
// };

// export default useDynamicStyles;

import { useTheme } from '@react-navigation/native';
import createTextStyles from '../styles/textStyles';

const useDynamicStyles = () => {
  const { colors } = useTheme();
  const textStyles = createTextStyles(colors);

  return { textStyles, colors };
};

export default useDynamicStyles;
