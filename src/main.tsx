import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/silkscreen/latin-400.css'
import '@fontsource/atkinson-hyperlegible/latin-400.css'
import '@fontsource/atkinson-hyperlegible/latin-700.css'
import App from './App'
import { LanguageProvider, readLanguage } from './i18n'
import './app.css'

document.documentElement.lang = readLanguage()
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider><App /></LanguageProvider>
  </StrictMode>,
)
