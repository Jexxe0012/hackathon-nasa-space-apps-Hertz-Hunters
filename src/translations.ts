import { spanishMessages } from './messages'

export type Language = 'en' | 'es'
export type MessageValues = Record<string, string | number>

// English source messages are the default; Spanish is an explicit user choice.
export function translateText(language: Language, message: string, values: MessageValues = {}): string {
  const text = language === 'es' ? spanishMessages[message] ?? message : message
  return text.replace(/\{(\w+)\}/g, (placeholder, key: string) => String(values[key] ?? placeholder))
}

export function speechLanguage(language: Language): string {
  return language === 'es' ? 'es-ES' : 'en-US'
}

export function narrationVoice(voices: SpeechSynthesisVoice[], language: Language): SpeechSynthesisVoice | undefined {
  const locale = speechLanguage(language).toLowerCase()
  return voices.find(voice => voice.lang.toLowerCase() === locale) ??
    voices.find(voice => voice.lang.toLowerCase().split('-')[0] === language)
}
