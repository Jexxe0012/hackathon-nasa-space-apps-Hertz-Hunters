import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { tracks, getTracks } from './data'
import { LanguageSwitcher, useLanguage } from './i18n'
import { Icon } from './Art'
import MapStage from './MapStage'
import Player from './Player'
import { useNarration } from './useNarration'
import { describeGuidedElement, isGuidedControl, nextGuidedStep, previousGuidedStep, type GuidedStep } from './guided-navigation'
import './guided.css'

const labels = ["Welcome", "Choose a story", "Meet the story", "Listen and explore", "What the data tells us"]

function savedContrast() {
  try { return localStorage.getItem('earth-jukebox.contrast') !== 'false' } catch { return true }
}

function initialStory() {
  const index = tracks.findIndex(track => location.hash === '#pista/' + track.id)
  return index >= 0 ? index : null
}

export default function GuidedExperience({ onVisualMode }: { onVisualMode: () => void }) {
  const { language, t } = useLanguage()
  const tracks = getTracks(language)
  const [step, setStep] = useState<GuidedStep>(0)
  const [selected, setSelected] = useState<number | null>(initialStory)
  const [contrast, setContrast] = useState(savedContrast)
  const [clickNavigation, setClickNavigation] = useState(true)
  const [hoverReading, setHoverReading] = useState(true)
  const [status, setStatus] = useState('')
  const [playing, setPlaying] = useState(false)
  const heading = useRef<HTMLHeadingElement>(null)
  const hoverTimer = useRef<number | undefined>(undefined)
  const lastHover = useRef('')
  const previousPlaying = useRef(false)
  const speech = useNarration()
  const track = tracks[selected ?? 3]
  const stopGuide = useCallback(() => {
    window.clearTimeout(hoverTimer.current)
    speech.stop()
  }, [speech.stop])

  const content = useMemo(() => {
    switch (step) {
      case 0: return {
        title: t("You can hear the Earth, too."),
        paragraphs: [t("Welcome to Earthbeat. Explore four NASA stories through clear descriptions and sound. You can use your screen reader or turn on our narration."), t("Choose how you would like to begin.")],
      }
      case 1: return {
        title: t("Which story would you like to hear?"),
        paragraphs: [t("Choose one of four stories. First, learn its context. Then listen at your own pace.")],
      }
      case 2: return {
        title: track.story.title,
        paragraphs: [track.story.introduction, t('Period: {period}.', { period: track.period }), track.story.listenFor],
      }
      case 3: return {
        title: t('Listen: {title}', { title: track.shortTitle }),
        paragraphs: [track.story.listenFor, t("Press Play in the player. The scene options let you explore dates, regions, or routes. Earthbeat narration stops while you listen to the data.")],
      }
      case 4: return {
        title: t("What does this journey tell us?"),
        paragraphs: [track.pattern, t('Interpretation limit: {limit}', { limit: track.limit })],
      }
    }
  }, [step, track, t])
  const narration = [content.title, ...content.paragraphs, ...(step === 1 ? [
    ...tracks.map(item => item.story.title),
    clickNavigation ? t("In the reading area, right-click to move forward and left-click to go back. Buttons keep their usual actions. You can also use Tab and Enter.") : t("Use the Previous and Next buttons. Tab moves between controls and Enter activates them."),
  ] : [])].join(' ')

  const pauseScene = () => {
    document.querySelector<HTMLIFrameElement>('iframe.escena-sonora')?.contentWindow?.postMessage({ eij: 'pausar' }, location.origin)
  }

  useEffect(() => {
    heading.current?.focus({ preventScroll: false })
    document.title = t('{step} · Guided experience · Earthbeat', { step: t(labels[step]) })
    lastHover.current = ''
    window.clearTimeout(hoverTimer.current)
    setStatus('')
  }, [step, selected, t])

  useEffect(() => {
    if (!speech.enabled) return
    const timer = window.setTimeout(() => speech.read(narration), 150)
    return () => window.clearTimeout(timer)
  }, [narration, speech.enabled, speech.read])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const frame = document.querySelector<HTMLIFrameElement>('iframe.escena-sonora')
      if (event.source !== frame?.contentWindow || event.origin !== location.origin) return
      if (event.data?.eij === 'entrada') stopGuide()
      if (event.data?.eij === 'leer' && speech.enabled && hoverReading && !playing && typeof event.data.texto === 'string')
        speech.read(event.data.texto.slice(0, 1500))
      if (event.data?.eij === 'estado') {
        const active = Boolean(event.data.sonando)
        setPlaying(active)
        if (active && !previousPlaying.current) stopGuide()
        previousPlaying.current = active
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [stopGuide, speech.enabled, speech.read, hoverReading, playing])

  useEffect(() => () => window.clearTimeout(hoverTimer.current), [])

  function go(next: GuidedStep) {
    pauseScene()
    speech.stop()
    window.clearTimeout(hoverTimer.current)
    setPlaying(false)
    previousPlaying.current = false
    setStatus('')
    setStep(next)
  }

  function next() {
    if (step === 1 && selected === null) {
      setStatus(t("First, choose a story using one of the four buttons."))
      if (speech.enabled) speech.read(t("First, choose a story using one of the four buttons."))
      return
    }
    go(nextGuidedStep(step, selected !== null))
  }

  function choose(index: number) {
    pauseScene()
    stopGuide()
    setSelected(index)
    setPlaying(false)
    previousPlaying.current = false
    setStatus('')
    setStep(2)
  }

  function begin(withVoice: boolean) {
    if (withVoice) speech.enable()
    else speech.disable()
    go(selected === null ? 1 : 2)
  }

  function leave() {
    pauseScene()
    speech.stop()
    location.hash = selected === null ? '#inicio' : '#pista/' + track.id
    onVisualMode()
  }

  function clickBack(event: MouseEvent<HTMLElement>) {
    if (!clickNavigation || step === 0 || isGuidedControl(event.target) || event.detail === 0) return
    if (event.button !== 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
    // Screen-reader and touch activation must retain native behavior.
    if (event.nativeEvent instanceof window.PointerEvent && event.nativeEvent.pointerType !== 'mouse') return
    go(previousGuidedStep(step))
  }

  function clickNext(event: MouseEvent<HTMLElement>) {
    if (!clickNavigation || step === 0 || isGuidedControl(event.target) || event.button !== 2 || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return
    if (event.nativeEvent instanceof window.PointerEvent && event.nativeEvent.pointerType !== 'mouse') return
    event.preventDefault()
    next()
  }

  function keyNavigation(event: KeyboardEvent<HTMLElement>) {
    if (step === 0 || isGuidedControl(event.target) || event.altKey || event.ctrlKey || event.metaKey) return
    if (event.key === 'ArrowRight') { event.preventDefault(); next() }
    if (event.key === 'ArrowLeft') { event.preventDefault(); go(previousGuidedStep(step)) }
    if (event.key === 'Escape') speech.stop()
  }

  function readUnderPointer(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== 'mouse' || !speech.enabled || !hoverReading || playing) return
    const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-read], button, summary, label, a, select, input') : null
    const text = target ? describeGuidedElement(target, language) : ''
    if (text === lastHover.current) return
    lastHover.current = text
    window.clearTimeout(hoverTimer.current)
    if (text) hoverTimer.current = window.setTimeout(() => speech.read(text), 600)
  }

  const nextLabel = step === 4 ? t("Choose another story") : step === 2 ? t("Start listening") : step === 3 ? t("What the data tells us") : t("Meet the story")

  return (
    <div className="console guided-app" data-contrast={contrast} data-reduced-motion="true"
      onPointerMove={readUnderPointer}
      onPointerLeave={() => { window.clearTimeout(hoverTimer.current); lastHover.current = '' }}
      onFocusCapture={event => {
        if (speech.enabled && !playing && event.target instanceof HTMLElement && event.target.matches('button, input, select, summary, a'))
          speech.read(describeGuidedElement(event.target, language))
      }}
    >
      <a className="skip" href="#guided-content" onClick={event => { event.preventDefault(); heading.current?.focus() }}>{t("Skip to content")}</a>
      <header className="guided-header">
        <button className="guided-brand" type="button" onClick={() => go(0)}>Earthbeat<span className="screen-reader-only">{t(", return to welcome")}</span></button>
        <span className="guided-progress">{step === 0 ? t("Guided experience") : t('Step {step} of 4 · {label}', { step, label: t(labels[step]) })}</span>
        <LanguageSwitcher />
        <button type="button" onClick={leave}>{t("Visual experience")}</button>
      </header>
      <main
        id="guided-content"
        className="guided-main"
        onClick={clickBack}
        onContextMenu={clickNext}
        onKeyDown={keyNavigation}
        aria-describedby={step > 0 && clickNavigation ? 'guided-click-help' : undefined}
      >
        <div className="guided-content">
          <h1 ref={heading} tabIndex={-1} data-read>{content.title}</h1>
          {content.paragraphs.map(paragraph => <p className="guided-copy" key={paragraph} data-read>{paragraph}</p>)}

          {step === 0 ? <>
            <div className="guided-start" role="group" aria-label={t("How to hear the guide")}>
              <button className="guided-primary" type="button" onClick={() => begin(false)}>{t("Start with my screen reader")}</button>
              <button type="button" disabled={!speech.supported} onClick={() => begin(true)}>{t("Start with Earthbeat narration")}</button>
            </div>
            <p className="guided-help" data-read>{t("If you use TalkBack on Android, NVDA, or VoiceOver, choose your screen reader. Turn on TalkBack in your device settings. Earthbeat narration is optional and starts only when you choose it.")}</p>
            {!speech.supported && <p role="status">{t("This browser does not support built-in speech. You can still use your screen reader and all controls.")}</p>}
            <section className="guided-instructions" aria-labelledby="guided-instructions-title">
              <h2 id="guided-instructions-title" data-read>{t("How to navigate")}</h2>
              <p data-read>{t("After you begin, you can right-click in the reading area to move forward and left-click to go back. Buttons keep their usual actions.")}</p>
              <p data-read>{t("Previous and Next buttons are also available. Use Tab to move between controls and Enter to activate them. With TalkBack, use your usual gestures.")}</p>
            </section>
          </> : <>
            {step === 1 && <div className="guided-stories" aria-label={t("Choose a story")}>
              {tracks.map((item, index) => <button type="button" key={item.id} onClick={() => choose(index)}>
                <strong>{item.story.title}</strong><span>{item.shortTitle} · {item.period}</span>
              </button>)}
            </div>}

            {step === 3 && <div data-guided-controls className="guided-scene">
              <h2>{t("Listening options")}</h2>
              <MapStage key={track.id} track={track} guided highContrast={contrast} />
              <details className="guided-instructions">
                <summary>{t("Read the full sound guide")}</summary>
                {track.guide.map(paragraph => <p key={paragraph} data-read>{paragraph}</p>)}
              </details>
            </div>}

            {step === 4 && <a className="guided-source" href={track.source} target="_blank" rel="noreferrer">{t("View the NASA source (new tab)")} <Icon name="external" /></a>}

            <div className="guided-tools" data-guided-controls>
              {speech.enabled ? <>
                <button type="button" onClick={() => { pauseScene(); speech.read(narration) }}>{t("Read again")}</button>
                <button type="button" onClick={speech.stop} disabled={!speech.speaking}>{t("Stop narration")}</button>
                <button type="button" onClick={speech.disable}>{t("Use my screen reader")}</button>
              </> : <button type="button" disabled={!speech.supported} onClick={() => { pauseScene(); speech.enable() }}>{t("Turn on Earthbeat narration")}</button>}
            </div>
            <details className="guided-preferences" data-guided-controls>
              <summary>{t("Guided experience preferences")}</summary>
              <label><input type="checkbox" checked={clickNavigation} onChange={event => setClickNavigation(event.target.checked)} />{t("Right-click to move forward and left-click to go back in the reading area")}</label>
              <label><input type="checkbox" checked={hoverReading} disabled={!speech.enabled} onChange={event => { setHoverReading(event.target.checked); window.clearTimeout(hoverTimer.current) }} />{t("Read text when the pointer rests on it")}</label>
              <label><input type="checkbox" checked={contrast} onChange={event => {
                setContrast(event.target.checked)
                try { localStorage.setItem('earth-jukebox.contrast', String(event.target.checked)) } catch { /* session preference */ }
              }} />{t("High contrast")}</label>
              <label>{t("Narration speed")} <select value={speech.rate} disabled={!speech.enabled} onChange={event => speech.setRate(Number(event.target.value))}>
                <option value={0.8}>{t("Slow")}</option><option value={1}>{t("Normal")}</option><option value={1.2}>{t("Fast")}</option>
              </select></label>
            </details>
            <p id="guided-click-help" className="guided-help">{clickNavigation ? t("Reading area: right-click for next; left-click for previous. Buttons and scene options keep their usual actions.") : t("Click navigation is off. Use the Previous and Next buttons.")}</p>
          </>}
          <p className="guided-status" role="status">{status || speech.error}</p>
        </div>
      </main>
      {step > 0 && <nav className="guided-navigation" aria-label={t("Navigate the experience")}>
        <button type="button" onClick={() => go(previousGuidedStep(step))}><span className="guided-back-icon" aria-hidden="true"><Icon name="right" /></span>{t("Previous")}</button>
        <button className="guided-primary" type="button" disabled={step === 1 && selected === null} onClick={next}>{nextLabel}<Icon name="right" /></button>
      </nav>}
      {step === 3 && <Player track={track} index={selected!} total={tracks.length} onBeforePlay={stopGuide} onPrevious={() => choose((selected! + tracks.length - 1) % tracks.length)} onNext={() => choose((selected! + 1) % tracks.length)} />}
    </div>
  )
}
