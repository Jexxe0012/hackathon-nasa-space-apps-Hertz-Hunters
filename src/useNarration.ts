import { useCallback, useEffect, useRef, useState } from 'react'
import { useLanguage } from './i18n'
import { narrationVoice, speechLanguage } from './translations'

export function useNarration() {
  const { language, t } = useLanguage()
  const supported = 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window
  const [enabled, setEnabled] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [error, setError] = useState('')
  const [rate, setRate] = useState(1)
  const enabledRef = useRef(false)
  const token = useRef(0)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const pendingTimer = useRef<number | undefined>(undefined)
  const startTimer = useRef<number | undefined>(undefined)

  const stop = useCallback(() => {
    token.current++
    window.clearTimeout(pendingTimer.current)
    window.clearTimeout(startTimer.current)
    if (supported && utteranceRef.current) window.speechSynthesis.cancel()
    utteranceRef.current = null
    setSpeaking(false)
  }, [supported])

  const read = useCallback((text: string) => {
    if (!supported || !enabledRef.current || !text.trim()) return
    stop()
    setError('')
    const current = token.current
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = speechLanguage(language)
    utterance.rate = rate
    const voice = narrationVoice(window.speechSynthesis.getVoices(), language)
    if (voice) utterance.voice = voice
    utterance.onstart = () => { if (current === token.current) window.clearTimeout(startTimer.current) }
    utterance.onend = () => {
      if (current !== token.current) return
      window.clearTimeout(startTimer.current)
      utteranceRef.current = null
      setSpeaking(false)
    }
    utterance.onerror = event => {
      if (current !== token.current) return
      window.clearTimeout(startTimer.current)
      utteranceRef.current = null
      setSpeaking(false)
      if (!['canceled', 'interrupted'].includes(event.error))
        setError("Narration could not play. Try reading again or use your screen reader.")
    }
    utteranceRef.current = utterance
    setSpeaking(true)
    // Let cancellation settle before queuing the next reading in Chromium.
    pendingTimer.current = window.setTimeout(() => {
      if (current !== token.current) return
      window.speechSynthesis.speak(utterance)
      startTimer.current = window.setTimeout(() => {
        if (current !== token.current) return
        stop()
        setError("Narration could not start in this browser. Try reading again or continue with your screen reader.")
      }, 6000)
    }, 60)
  }, [supported, rate, stop, language])

  useEffect(() => {
    stop()
    setError('')
  }, [language, stop])

  const enable = useCallback(() => {
    if (!supported) return
    enabledRef.current = true
    setEnabled(true)
  }, [supported])

  const disable = useCallback(() => {
    enabledRef.current = false
    setEnabled(false)
    setError('')
    stop()
  }, [stop])

  useEffect(() => {
    if (supported) window.speechSynthesis.getVoices()
    return () => {
      token.current++
      window.clearTimeout(pendingTimer.current)
      window.clearTimeout(startTimer.current)
      if (supported && utteranceRef.current) window.speechSynthesis.cancel()
    }
  }, [supported])

  return { supported, enabled, speaking, error: t(error), rate, setRate, enable, disable, read, stop }
}
