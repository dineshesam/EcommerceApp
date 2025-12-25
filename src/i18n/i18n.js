
// src/i18n/index.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  te: { translation: te },
};

const i18nConfig = {
  resources,
  lng: 'en',            // Default language
  fallbackLng: 'en',    // Fallback if selected language is missing
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  // debug: true,        // enable while developing if needed
};

i18n.use(initReactI18next).init(i18nConfig);

export default i18n;
