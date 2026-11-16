import { createContext, useCallback, useContext, useLayoutEffect, useState, type ReactNode } from 'react'
import { translateText, type Language, type MessageValues } from './translations'
import './language.css'

export function readLanguage(): Language {
  try { return localStorage.getItem('earthbeat.language') === 'es' ? 'es' : 'en' } catch { return 'en' }
}

const LanguageContext = createContext<{
  language: Language
  setLanguage: (language: Language) => void
  t: (message: string, values?: MessageValues) => string
} | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, updateLanguage] = useState<Language>(readLanguage)
  const t = useCallback((message: string, values?: MessageValues) => translateText(language, message, values), [language])
  const setLanguage = useCallback((next: Language) => {
    try { localStorage.setItem('earthbeat.language', next) } catch { /* Applies for this visit. */ }
    updateLanguage(next)
  }, [])

  useLayoutEffect(() => {
    document.documentElement.lang = language
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('Explore four NASA Earth stories with Earthbeat, an accessible player by Hertz Hunters.'))
  }, [language, t])

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('LanguageProvider is required')
  return context
}

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  return <label className="language-switcher">
    <span className="language-switcher__label">{t('Language')}</span>
    <select value={language} onChange={event => setLanguage(event.target.value === 'es' ? 'es' : 'en')}>
      <option value="en" lang="en">English</option>
      <option value="es" lang="es">Español</option>
    </select>
  </label>
}
