import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import hi from './hi.json'
import ta from './ta.json'
import te from './te.json'

export const LANGUAGES = [
  { code: 'hi', label: 'हिंदी', flag: '🇮🇳', name: 'Hindi' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳', name: 'Tamil' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳', name: 'Telugu' },
]

i18n.use(initReactI18next).init({
  resources: {
    hi: { translation: hi },
    ta: { translation: ta },
    te: { translation: te },
  },
  lng: 'hi',
  fallbackLng: 'hi',
  interpolation: { escapeValue: false },
})

export default i18n