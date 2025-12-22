
import { DefaultTheme, DarkTheme } from '@react-navigation/native';

const CustomLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,

    /** Core surfaces (keep for React Navigation compatibility) */
    background: '#FFFFFF',
    text: '#0B1F2A',
    card: '#F7F8FA',
    border: '#E3E8EF',

    /** E‑commerce semantic colors */
    primaryBg: '#FFFFFF',              // Main page background
    primaryText: '#0B1F2A',            // Body text
    secondaryText: '#475569',          // Muted descriptions, metadata

    brandAccent: '#1F7A8C',            // Brand accent (icons, links, highlights)
    brandAccentHover: '#16697A',

    tabBackground: '#EAF2F6',          // Tabs / segmented control bg
    sectionBackground: '#F3F6F8',      // Category strips, info bands

    ctaButtonBg: '#2DA44E',            // Primary CTA: "Add to Cart", "Buy Now"
    ctaButtonText: '#FFFFFF',
    ctaButtonBgHover: '#269244',
    ctaButtonBgPressed: '#22833D',

    disabledButtonBg: '#DCE6EA',       // Disabled / inactive
    disabledButtonText: '#7A8C99',

    /** Commerce-specific feedback & highlights */
    priceText: '#0E4F2B',              // Price / discount price
    comparePriceText: '#7A8C99',       // Strikethrough old price
    saleBadgeBg: '#EF4444',            // Sale / discount badge
    saleBadgeText: '#FFFFFF',

    ratingStar: '#F5A623',             // Star rating color
    inventoryInStock: '#2DA44E',       // In-stock indicator
    inventoryLowStock: '#F59E0B',      // Low stock
    inventoryOutOfStock: '#EF4444',    // Out of stock

    /** System feedback */
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    /** UI chrome */
    inputBg: '#FFFFFF',
    inputBorder: '#D7DEE6',
    inputPlaceholder: '#93A4B1',
    divider: '#E6EDF3',
    overlay: 'rgba(9, 17, 23, 0.5)',   // Modals, image zoom
    shadow: 'rgba(16, 24, 40, 0.08)',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,

    /** Core surfaces (keep for React Navigation compatibility) */
    background: '#0B1217',
    text: '#EAF0F5',
    card: '#141A21',
    border: '#23303A',

    /** E‑commerce semantic colors */
    primaryBg: '#0B1217',
    primaryText: '#EAF0F5',
    secondaryText: '#A7B4BE',

    brandAccent: '#7CC4D6',
    brandAccentHover: '#6BB4C7',

    tabBackground: '#0F1720',
    sectionBackground: '#111820',

    ctaButtonBg: '#2DA44E',            // Keep CTA consistent for brand memory
    ctaButtonText: '#FFFFFF',
    ctaButtonBgHover: '#33B35A',
    ctaButtonBgPressed: '#238C40',

    disabledButtonBg: '#1B232C',
    disabledButtonText: '#8A99A6',

    /** Commerce-specific feedback & highlights */
    priceText: '#8CE2A9',              // Price stands out on dark
    comparePriceText: '#7E8B97',
    saleBadgeBg: '#F87171',
    saleBadgeText: '#1B232C',

    ratingStar: '#F5A623',
    inventoryInStock: '#34D399',
    inventoryLowStock: '#F59E0B',
    inventoryOutOfStock: '#F87171',

    /** System feedback */
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#60A5FA',

    /** UI chrome */
    inputBg: '#0F1720',
    inputBorder: '#23303A',
    inputPlaceholder: '#8A99A6',
    divider: '#1E293B',
    overlay: 'rgba(0, 0, 0, 0.55)',
    shadow: 'rgba(3, 7, 18, 0.6)',
  },
};

export { CustomLightTheme, CustomDarkTheme };