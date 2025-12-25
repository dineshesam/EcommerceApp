
// components/LanguageSwitcher.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, I18nManager } from "react-native";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Props:
 * - colors: theme object { primaryText, secondaryText, inputBg, inputBorder, brandAccent }
 * - style: container style override
 * - showLabel: boolean (default: true)
 * - label: optional custom label text; default uses i18n key "settings.language"
 * - compact: boolean (default: false) -> smaller buttons
 * - persistSelection: boolean (default: true) -> store language to AsyncStorage
 * - languages: array of language codes (default: ["en", "hi", "te"])
 */
export default function LanguageSwitcher({
  colors,
  style,
  showLabel = true,
  label,
  compact = false,
  persistSelection = true,
  languages = ["en", "hi", "te"]
}) {
  const { i18n, t } = useTranslation();
  const s = styles(colors, compact);

  const changeLanguage = async (lng) => {
    await i18n.changeLanguage(lng);
    if (persistSelection) {
      try {
        await AsyncStorage.setItem("appLanguage", lng);
      } catch {}
    }

    // Optional: RTL handling if you add Arabic/Hebrew later
    // const isRTL = ["ar", "he", "fa", "ur"].includes(lng);
    // if (I18nManager.isRTL !== isRTL) {
    //   I18nManager.allowRTL(isRTL);
    //   I18nManager.forceRTL(isRTL);
    //   // App reload may be needed for full RTL layout changes
    // }
  };

  return (
    <View style={[s.container, style]}>
      {showLabel && (
        <Text style={[s.label, { color: colors?.secondaryText }]}>
          {label ?? t("settings.language", "Language")}
        </Text>
      )}

      <View style={s.row}>
        {languages.map((lng) => {
          const selected = i18n.language === lng;
          return (
            <TouchableOpacity
              key={lng}
              style={[
                s.btn,
                selected && { borderColor: colors?.brandAccent }
              ]}
              onPress={() => changeLanguage(lng)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Switch language to ${lng}`}
              accessibilityState={{ selected }}
            >
              <Text style={[s.btnText, { color: colors?.primaryText }]}>
                {lng==="en"? "english":lng==="hi"? " हिन्दी": "తెలుగు"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = (colors, compact) =>
  StyleSheet.create({
    container: { width: "90%" },
    label: { fontSize: 14, marginBottom: 8 },
    row: { flexDirection: "row", gap: 10 },
    btn: {
      flex: 1,
      paddingVertical: compact ? 8 : 10,
      borderWidth: 1,
      borderRadius: 8,
      borderColor: colors?.inputBorder,
      alignItems: "center",
      backgroundColor: colors?.inputBg
    },
    btnText: {
      fontSize: compact ? 13 : 14,
      fontWeight: "700"
    }
  });
