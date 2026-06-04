import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './resources';

const STORAGE_KEY = 'habitscape_language';
const fallbackLanguage = 'en';
const supportedLanguages = ['en', 'id'];

const storedLanguage = localStorage.getItem(STORAGE_KEY);
const initialLanguage = supportedLanguages.includes(storedLanguage) ? storedLanguage : fallbackLanguage;

document.documentElement.lang = initialLanguage;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: fallbackLanguage,
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', (language) => {
  localStorage.setItem(STORAGE_KEY, language);
  document.documentElement.lang = language;
});

export default i18n;
