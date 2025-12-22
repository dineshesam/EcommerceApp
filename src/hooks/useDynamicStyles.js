import { useTheme } from '@react-navigation/native';

const useDynamicStyles = () => {
  const { colors } = useTheme();
  return { colors };
};

export default useDynamicStyles;