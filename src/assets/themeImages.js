const lightImages = {
  applelogo: require('../assets/images/light/apple.png'),
//   samsunglogo: require('../assets/images/light/samsung.png'),
};

const darkImages = {
  applelogo: require('../assets/images/dark/apple.png'),
//   samsunglogo: require('../assets/images/dark/samsung.png'),
};

export const getThemeImages = (isDark) => {
  return isDark ? darkImages : lightImages;
};
