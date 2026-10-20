import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import english from './en.json'
import french from './fr.json'

void i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: french },
    en: { translation: english },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
