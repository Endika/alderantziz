import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import en from './locales/en.json'
import es from './locales/es.json'
import eu from './locales/eu.json'

export const LANGUAGES = ['es', 'eu', 'en'] as const

function syncDocumentLang(code: string | undefined): void {
  if (typeof document === 'undefined' || !code) return
  document.documentElement.lang = code
}

i18n.on('languageChanged', syncDocumentLang)

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      eu: { translation: eu },
    },
    fallbackLng: 'en',
    supportedLngs: [...LANGUAGES],
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'], caches: ['localStorage'] },
  })
  .then(() => syncDocumentLang(i18n.resolvedLanguage))

export default i18n
