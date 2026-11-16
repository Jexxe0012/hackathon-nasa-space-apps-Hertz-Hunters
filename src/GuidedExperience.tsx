import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react'
import { tracks } from './data'
import { Icon } from './Art'
import MapStage from './MapStage'
import Player from './Player'
import { useNarration } from './useNarration'
import { describeGuidedElement, isGuidedControl, nextGuidedStep, previousGuidedStep, type GuidedStep } from './guided-navigation'
import './guided.css'

const labels = ['Bienvenida', 'Elegir historia', 'Conocer la historia', 'Escuchar y explorar', 'Qué cuenta el dato']

function savedContrast() {
  try { return localStorage.getItem('earth-jukebox.contrast') !== 'false' } catch { return true }
}

function initialStory() {
  const index = tracks.findIndex(track => location.hash === '#pista/' + track.id)
  return index >= 0 ? index : null
}

export default function GuidedExperience({ onVisualMode }: { onVisualMode: () => void }) {
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
        title: 'La Tierra también se puede escuchar.',
        paragraphs: ['Bienvenido a Earthbeat. Explora cuatro historias de la NASA con descripciones claras y sonido. Puedes usar tu lector de pantalla o activar nuestra voz de guía.', 'Elige cómo quieres empezar.'],
      }
      case 1: return {
        title: '¿Qué historia quieres escuchar?',
        paragraphs: ['Elige una de las cuatro historias. Primero conocerás su contexto y después podrás escucharla a tu ritmo.'],
      }
      case 2: return {
        title: track.story.title,
        paragraphs: [track.story.introduction, `Periodo: ${track.period}.`, track.story.listenFor],
      }
      case 3: return {
        title: `Escuchar: ${track.shortTitle}`,
        paragraphs: [track.story.listenFor, 'Pulsa Reproducir en el reproductor. Las opciones de la escena permiten explorar sus fechas, zonas o recorridos. La voz de Earthbeat se detiene mientras escuchas los datos.'],
      }
      case 4: return {
        title: '¿Qué cuenta este recorrido?',
        paragraphs: [track.pattern, `Límite de interpretación: ${track.limit}`],
      }
    }
  }, [step, track])
  const narration = [content.title, ...content.paragraphs, ...(step === 1 ? [
    ...tracks.map(item => item.story.title),
    clickNavigation ? 'En el área de lectura, clic derecho avanza y clic izquierdo regresa. Los botones conservan su acción. También puedes usar Tab e Intro.' : 'Usa los botones Anterior y Siguiente. Tab recorre los controles e Intro los activa.',
  ] : [])].join(' ')

  const pauseScene = () => {
    document.querySelector<HTMLIFrameElement>('iframe.escena-sonora')?.contentWindow?.postMessage({ eij: 'pausar' }, location.origin)
  }

  useEffect(() => {
    heading.current?.focus({ preventScroll: false })
    document.title = `${labels[step]} · Experiencia guiada · Earthbeat`
    lastHover.current = ''
  }, [step, selected])

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
      setStatus('Primero elige una historia con uno de los cuatro botones.')
      if (speech.enabled) speech.read('Primero elige una historia con uno de los cuatro botones.')
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
    const text = target ? describeGuidedElement(target) : ''
    if (text === lastHover.current) return
    lastHover.current = text
    window.clearTimeout(hoverTimer.current)
    if (text) hoverTimer.current = window.setTimeout(() => speech.read(text), 600)
  }

  const nextLabel = step === 4 ? 'Elegir otra historia' : step === 2 ? 'Ir a la escucha' : step === 3 ? 'Qué cuenta el dato' : 'Conocer la historia'

  return (
    <div className="console guided-app" data-contrast={contrast} data-reduced-motion="true"
      onPointerMove={readUnderPointer}
      onPointerLeave={() => { window.clearTimeout(hoverTimer.current); lastHover.current = '' }}
      onFocusCapture={event => {
        if (speech.enabled && !playing && event.target instanceof HTMLElement && event.target.matches('button, input, select, summary, a'))
          speech.read(describeGuidedElement(event.target))
      }}
    >
      <a className="skip" href="#guided-content" onClick={event => { event.preventDefault(); heading.current?.focus() }}>Saltar al contenido</a>
      <header className="guided-header">
        <button className="guided-brand" type="button" onClick={() => go(0)}>Earthbeat<span className="screen-reader-only">, volver a la bienvenida</span></button>
        <span className="guided-progress">{step === 0 ? 'Experiencia guiada' : `Paso ${step} de 4 · ${labels[step]}`}</span>
        <button type="button" onClick={leave}>Experiencia visual</button>
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
            <div className="guided-start" role="group" aria-label="Cómo escuchar la guía">
              <button className="guided-primary" type="button" onClick={() => begin(false)}>Comenzar con mi lector de pantalla</button>
              <button type="button" disabled={!speech.supported} onClick={() => begin(true)}>Comenzar con voz de Earthbeat</button>
            </div>
            <p className="guided-help" data-read>Si usas TalkBack en Android, NVDA o VoiceOver, elige tu lector de pantalla. TalkBack se activa en los ajustes del dispositivo. La voz de Earthbeat es opcional y se activa solo al elegirla.</p>
            {!speech.supported && <p role="status">Este navegador no ofrece voz integrada. Puedes usar tu lector de pantalla y todos los controles.</p>}
            <section className="guided-instructions" aria-labelledby="guided-instructions-title">
              <h2 id="guided-instructions-title" data-read>Cómo moverte</h2>
              <p data-read>Después de comenzar, en el área de lectura puedes hacer clic derecho para avanzar y clic izquierdo para regresar. Los botones conservan su acción habitual.</p>
              <p data-read>También tienes botones Anterior y Siguiente. Usa Tab para recorrer controles e Intro para activarlos. Con TalkBack, utiliza tus gestos habituales.</p>
            </section>
          </> : <>
            {step === 1 && <div className="guided-stories" aria-label="Elegir una historia">
              {tracks.map((item, index) => <button type="button" key={item.id} onClick={() => choose(index)}>
                <strong>{item.story.title}</strong><span>{item.shortTitle} · {item.period}</span>
              </button>)}
            </div>}

            {step === 3 && <div data-guided-controls className="guided-scene">
              <h2>Opciones de escucha</h2>
              <MapStage key={track.id} track={track} guided highContrast={contrast} />
              <details className="guided-instructions">
                <summary>Leer la guía sonora completa</summary>
                {track.guide.map(paragraph => <p key={paragraph} data-read>{paragraph}</p>)}
              </details>
            </div>}

            {step === 4 && <a className="guided-source" href={track.source} target="_blank" rel="noreferrer">Consultar la fuente NASA (nueva pestaña) <Icon name="external" /></a>}

            <div className="guided-tools" data-guided-controls>
              {speech.enabled ? <>
                <button type="button" onClick={() => { pauseScene(); speech.read(narration) }}>Repetir lectura</button>
                <button type="button" onClick={speech.stop} disabled={!speech.speaking}>Detener voz</button>
                <button type="button" onClick={speech.disable}>Usar mi lector de pantalla</button>
              </> : <button type="button" disabled={!speech.supported} onClick={() => { pauseScene(); speech.enable() }}>Activar voz de Earthbeat</button>}
            </div>
            <details className="guided-preferences" data-guided-controls>
              <summary>Preferencias de la experiencia guiada</summary>
              <label><input type="checkbox" checked={clickNavigation} onChange={event => setClickNavigation(event.target.checked)} />Clic derecho para avanzar e izquierdo para regresar en el área de lectura</label>
              <label><input type="checkbox" checked={hoverReading} disabled={!speech.enabled} onChange={event => { setHoverReading(event.target.checked); window.clearTimeout(hoverTimer.current) }} />Leer el texto al detener el ratón sobre él</label>
              <label><input type="checkbox" checked={contrast} onChange={event => {
                setContrast(event.target.checked)
                try { localStorage.setItem('earth-jukebox.contrast', String(event.target.checked)) } catch { /* session preference */ }
              }} />Alto contraste</label>
              <label>Velocidad de la voz <select value={speech.rate} disabled={!speech.enabled} onChange={event => speech.setRate(Number(event.target.value))}>
                <option value={0.8}>Lenta</option><option value={1}>Normal</option><option value={1.2}>Rápida</option>
              </select></label>
            </details>
            <p id="guided-click-help" className="guided-help">{clickNavigation ? 'Área de lectura: clic derecho, siguiente; clic izquierdo, anterior. Los botones y las opciones de la escena conservan sus acciones.' : 'Navegación por clics desactivada. Usa los botones Anterior y Siguiente.'}</p>
          </>}
          <p className="guided-status" role="status">{status || speech.error}</p>
        </div>
      </main>
      {step > 0 && <nav className="guided-navigation" aria-label="Navegar por la experiencia">
        <button type="button" onClick={() => go(previousGuidedStep(step))}><span className="guided-back-icon" aria-hidden="true"><Icon name="right" /></span>Anterior</button>
        <button className="guided-primary" type="button" disabled={step === 1 && selected === null} onClick={next}>{nextLabel}<Icon name="right" /></button>
      </nav>}
      {step === 3 && <Player track={track} index={selected!} total={tracks.length} onBeforePlay={stopGuide} onPrevious={() => choose((selected! + tracks.length - 1) % tracks.length)} onNext={() => choose((selected! + 1) % tracks.length)} />}
    </div>
  )
}
