
// src/components/CustomToast.js
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, useColorScheme, Platform, View, Text } from 'react-native';

const palette = {
  light: {
    bg: 'rgba(17, 24, 39, 0.95)', // dark pill on light theme
    text: '#FFFFFF',
    success: '#22c55e',
    error: '#ef4444',
    info: '#38bdf8',
  },
  dark: {
    bg: 'rgba(243, 244, 246, 0.98)', // light pill on dark theme
    text: '#111827',
    success: '#22c55e',
    error: '#f87171',
    info: '#38bdf8',
  },
};

const FadePill = ({ text1, text2, type }) => {
  const scheme = useColorScheme() ?? 'light';
  const colors = palette[scheme];
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 160, useNativeDriver: true }).start();
    return () => {
      Animated.timing(opacity, { toValue: 0, duration: 140, useNativeDriver: true }).start();
    };
  }, [opacity]);

  const accent =
    type === 'success' ? colors.success : type === 'error' ? colors.error : colors.info;

  return (
    <Animated.View
      style={[
        styles.pill,
        { backgroundColor: colors.bg, opacity, borderLeftColor: accent },
        Platform.select({
          ios: styles.iosShadow,
          android: styles.androidShadow,
        }),
      ]}
      // Tap to dismiss (optional)
      onStartShouldSetResponder={() => true}
      onResponderRelease={() => {
        // no-op; if you want: import Toast and call Toast.hide();
      }}
    >
      {/* Single-line headline; second line optional but still compact */}
      {!!text1 && <Text style={[styles.text1, { color: colors.text }]} numberOfLines={1}>{text1}</Text>}
      {!!text2 && <Text style={[styles.text2, { color: colors.text }]} numberOfLines={1}>{text2}</Text>}
    </Animated.View>
  );
};

export const toastConfig = {
  success: (props) => <FadePill {...props} type="success" />,
  error:   (props) => <FadePill {...props} type="error" />,
  info:    (props) => <FadePill {...props} type="info" />,
};

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,     // compact
    minHeight: 32,
    maxWidth: 520,
    width: '92%',           // compact side margins
    borderLeftWidth: 4,     // small accent bar
  },
  text1: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  text2: {
    fontSize: 12,
    marginTop: 2,
  },
  iosShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
  },
  androidShadow: {
    elevation: 5,
  },
});
