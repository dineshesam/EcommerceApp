
// components/SearchBar.js
import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  I18nManager,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import useDynamicStyles from '../hooks/useDynamicStyles';

export default function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder, // optional override, falls back to i18n
  leftIconSource = require('../assets/icons/search.png'),
  rightIconSource = require('../assets/icons/close.png'),
  showRightIcon = true,
  containerStyle,
  inputStyle,
  onSubmitEditing = () => {}, // default no-op
}) {
  const { colors } = useDynamicStyles();
  const styles = createStyles(colors);
  const { t } = useTranslation();

  const computedPlaceholder = placeholder ?? t('shop.searchProducts');

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Left icon (search) */}
      <Image
        source={leftIconSource}
        style={[styles.icon, { tintColor: colors.brandAccent }]}
      />

      {/* Input */}
      <TextInput
        style={[
          styles.input,
          { color: colors.primaryText, textAlign: I18nManager.isRTL ? 'right' : 'left' },
          inputStyle,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={computedPlaceholder}
        placeholderTextColor={colors.inputPlaceholder}
        returnKeyType="search"
        onSubmitEditing={onSubmitEditing}
      />

      {/* Right icon (clear) */}
      {showRightIcon && !!value?.length && (
        <TouchableOpacity
          onPress={onClear}
          accessibilityRole="button"
          accessibilityLabel={t('common.clearSearch')}
          accessibilityHint={t('common.clearSearchHint')}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.rightIconWrapper}
        >
          <Image
            source={rightIconSource}
            style={[styles.icon, { tintColor: colors.secondaryText }]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 10,
      paddingHorizontal: 10,
      height: 44,
      marginVertical: 10,
      marginHorizontal: 10,

      backgroundColor: colors.inputBg,
      borderWidth: 1,
      borderColor: colors.inputBorder,

      ...(Platform.OS === 'ios'
        ? {
            shadowColor: colors.shadow,
            shadowOpacity: 0.06,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 3 },
          }
        : {
            elevation: 0,
          }),
    },
    icon: {
      width: 22,
      height: 22,
      marginHorizontal: 4,
    },
    rightIconWrapper: {
      paddingLeft: 4,
    },
    input: {
      flex: 1,
      paddingHorizontal: 10,
      fontSize: 15,
    },
  });
}
