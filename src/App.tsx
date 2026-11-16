import { useEffect, useRef, useState } from 'react'
import { tracks, listeningLegend } from './data'
import { Icon, Sprite } from './Art'
import Player from './Player'
import MapStage from './MapStage'
import { WelcomeGlobe } from './WelcomeGlobe'

const families = [
  'Océanos',
  'Bosques',
  'Atmósfera',
  'Huella humana',
]
const spriteIndexes = [1, 8, 3, 0]
const voiceNotice =
  'Puedes navegar con teclado y un lector de pantalla como TalkBack. La voz integrada de Earthbeat está en desarrollo.'
const number = (i: number) => String(i + 1).padStart(2, '0')
const trackHref = (index: number) => '#pista/' + tracks[index].id
function readLocation() {
  const location = window.location.hash
  const index = tracks.findIndex((track) => location === '#pista/' + track.id)
  return {
    welcome: location === '' || location === '#inicio',
    library: location === '#coleccion',
    index: Math.max(0, index),
  }
}
function readOption(key: string, fallback: boolean) {
  try {
    const stored = localStorage.getItem('earth-jukebox.' + key)
    return stored === null ? fallback : stored === 'true'
  } catch {
    return fallback
  }
}
function usePreference(key: string, fallback: boolean) {
  const [value, setValue] = useState(() => readOption(key, fallback))
  useEffect(() => {
    try {
      localStorage.setItem('earth-jukebox.' + key, String(value))
    } catch {
      /* Preferences still apply in this session. */
    }
  }, [key, value])
  return [value, setValue] as const
}

export default function App() {
  const [view, setView] = useState(readLocation)
  const [selected, select] = useState(view.index)
  const [hasSelected, setHasSelected] = useState(!view.welcome && !view.library)
  const [modal, setModal] = useState<'help' | 'settings' | null>(null)
  const [noticeVisible, setNoticeVisible] = useState(true)
  const [noticeAnnouncement, setNoticeAnnouncement] = useState('')
  const [info, setInfo] = useState<'track' | 'audio'>('track')
  const [contrast, setContrast] = usePreference('contrast', false)
  const [reduced, setReduced] = usePreference(
    'motion',
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )
  const dialog = useRef<HTMLDialogElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const main = useRef<HTMLElement>(null)
  const track = tracks[selected]
  const previousRoute = useRef(view.welcome ? 'welcome' : view.library ? 'collection' : track.id)

  useEffect(() => {
    if (!noticeVisible) {
      setNoticeAnnouncement('')
      return
    }
    const timer = window.setTimeout(() => setNoticeAnnouncement(voiceNotice), 600)
    return () => window.clearTimeout(timer)
  }, [noticeVisible])

  useEffect(() => {
    const update = () => {
      const next = readLocation()
      if (!next.welcome && !next.library) {
        select(next.index)
        setHasSelected(true)
      }
      setView(next)
      setInfo('track')
    }
    window.addEventListener('hashchange', update)
    return () => window.removeEventListener('hashchange', update)
  }, [])
  useEffect(() => {
    document.title =
      (view.welcome ? 'Bienvenida' : view.library ? 'Colección' : track.title) + ' · Earthbeat'
    main.current?.scrollTo(0, 0)
    const route = view.welcome ? 'welcome' : view.library ? 'collection' : track.id
    if (previousRoute.current !== route && !document.activeElement?.closest('#reproductor'))
      heading.current?.focus({ preventScroll: true })
    previousRoute.current = route
  }, [view.welcome, view.library, track.id, track.title])
  useEffect(() => {
    if (modal && !dialog.current?.open) dialog.current?.showModal()
    if (!modal && dialog.current?.open) dialog.current.close()
  }, [modal])
  function navigate(index: number) {
    window.location.hash = trackHref((index + tracks.length) % tracks.length)
  }

  return (
    <div
      className="console"
      data-contrast={contrast}
      data-reduced-motion={reduced}
    >
      <a
        className="skip"
        href="#workspace"
        onClick={(e) => {
          e.preventDefault()
          main.current?.focus()
        }}
      >
        Saltar al contenido
      </a>
      <a
        className="skip"
        href="#ajustes"
        aria-haspopup="dialog"
        onClick={(event) => {
          event.preventDefault()
          setModal('settings')
        }}
      >
        Ir a opciones de accesibilidad
      </a>
      {!view.welcome && hasSelected && <a
        className="skip"
        href="#reproductor"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('reproductor')?.focus()
        }}
      >
        Saltar al reproductor
      </a>}
      <header className="masthead">
        <a
          className="brand"
          href="#inicio"
          aria-label="Earthbeat, ir al inicio"
        >
          <Sprite className="brand-planet" />
          <span>Earthbeat</span>
        </a>
        <nav className="primary-nav" aria-label="Principal">
          <a
            href={trackHref(selected)}
            aria-current={!view.library && !view.welcome ? 'page' : undefined}
          >
            <Icon name="signal" />
            <span>Reproductor</span>
          </a>
          <a href="#coleccion" aria-current={view.library ? 'page' : undefined}>
            <Icon name="grid" />
            <span>Colección</span>
          </a>
        </nav>
        <div className="utilities">
          <button
            aria-label="Ajustes de accesibilidad"
            onClick={() => setModal('settings')}
          >
            <Icon name="sliders" />
            <span>Ajustes</span>
          </button>
          <button
            className="help-btn"
            aria-label="Ayuda"
            title="Ayuda"
            onClick={() => setModal('help')}
          >
            <Icon name="help" />
          </button>
        </div>
      </header>
      <div className={view.welcome ? 'workarea workarea--welcome' : 'workarea'}>
        {!view.welcome && <aside className="library" aria-label="Biblioteca de pistas">
          <div className="library-title">
            <h2>Biblioteca</h2>
            <span>{number(tracks.length - 1)}</span>
          </div>
          <nav aria-label="Seleccionar pista">
            <ol>
              {tracks.map((item, i) => (
                <li key={item.id}>
                  <a
                    href={trackHref(i)}
                    className={
                      'track-link ' + (hasSelected && selected === i ? 'selected' : '')
                    }
                    aria-current={
                      hasSelected && selected === i && !view.library ? 'page' : undefined
                    }
                  >
                    <span aria-hidden="true" className="list-num">
                      {number(i)}
                    </span>
                    <span className={'sprite-tile tile-' + i}>
                      <Sprite index={spriteIndexes[i]} />
                    </span>
                    <span className="list-copy">
                      <strong>{item.shortTitle}</strong>
                      <small>{families[i]}</small>
                    </span>
                    {hasSelected && selected === i && (
                      <span
                        className="selected-light"
                        aria-label="Pista seleccionada"
                      />
                    )}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <button className="listen-help" onClick={() => setModal('help')}>
            <Icon name="headset" />
            Cómo escuchar
          </button>
        </aside>}
        <main
          id="workspace"
          ref={main}
          tabIndex={-1}
          data-scene={view.library || view.welcome ? undefined : track.id}
        >
          {noticeVisible && (
            <div className="access-notice">
              <Icon name="headset" />
              <p>
                <span aria-hidden="true"><strong>Aviso de accesibilidad.</strong> {voiceNotice}</span>
                <span className="screen-reader-only" role="status" aria-live="polite" aria-atomic="true">
                  {noticeAnnouncement ? 'Aviso de accesibilidad. ' + noticeAnnouncement : ''}
                </span>
              </p>
              <button type="button" aria-label="Cerrar aviso de accesibilidad" onClick={() => {
                setNoticeVisible(false)
                heading.current?.focus({ preventScroll: true })
              }}>
                <Icon name="close" />
              </button>
            </div>
          )}
          {view.welcome ? (
            <div className="welcome">
              <div className="welcome__hero">
                <div className="welcome__copy">
                  <h1 ref={heading} tabIndex={-1}>La Tierra también se puede escuchar.</h1>
                  <p className="welcome__lead">
                    Descubre historias de nuestro planeta a través de datos de la NASA.
                    Escucha el mar, recorre un bosque y vuelve a un año que recuerdas.
                  </p>
                  <a className="welcome__action" href="#coleccion">
                    Explorar la colección <Icon name="right" />
                  </a>
                  <button className="welcome__accessibility" type="button" aria-haspopup="dialog" onClick={() => setModal('settings')}>
                    <Icon name="sliders" /> Opciones de accesibilidad
                  </button>
                  <p className="welcome__note">Puedes navegar con teclado y usar un lector de pantalla.</p>
                </div>
                <WelcomeGlobe reducedMotion={reduced} forestImage={tracks[1].image} />
              </div>
              <section className="welcome__story" aria-labelledby="welcome-story-title">
                <img src={tracks[3].image} alt="" loading="lazy" />
                <div>
                  <h2 id="welcome-story-title">{tracks[3].story.title}</h2>
                  <p>{tracks[3].story.teaser} Compara sus luces nocturnas con las de 2019.</p>
                  <a href={trackHref(3)}>{tracks[3].story.action} <Icon name="right" /></a>
                </div>
              </section>
              <section className="welcome__guide" aria-labelledby="welcome-guide-title">
                <h2 id="welcome-guide-title">¿Cómo funciona?</h2>
                <ol className="welcome__steps">
                  <li><Icon name="grid"/><div><h3>Elige una historia</h3><p>Empieza por una pregunta que te dé curiosidad sobre la Tierra.</p></div></li>
                  <li><Icon name="book"/><div><h3>Aprende a escucharla</h3><p>Conoce qué representa cada sonido y qué permiten concluir los datos.</p></div></li>
                  <li><Icon name="headset"/><div><h3>Explora a tu ritmo</h3><p>Reproduce, pausa y usa los controles del visor para recorrer la historia.</p></div></li>
                </ol>
                <p className="welcome__disclaimer">Lo que escuchas es una sonificación: los instrumentos representan datos. Las descripciones te acompañan en cada recorrido.</p>
              </section>
            </div>
          ) : view.library ? (
            <div className="page-content">
              <h1 ref={heading} tabIndex={-1}>
                Colección
              </h1>
              <p className="intro">
                Cuatro historias para acercarte a la Tierra. Elige una pregunta y
                explora los datos que la acompañan.
              </p>
              <div className="album-grid">
                {tracks.map((item, i) => (
                  <a className="album" key={item.id} href={trackHref(i)}>
                    <img src={item.image} alt="" loading="lazy" />
                    <div className="album-copy">
                      <h2>{item.story.title}</h2>
                      <span className="album-category">{item.title}</span>
                      <p className="album-description">{item.story.teaser}</p>
                      <span className="album-period">{item.period}</span>
                      <span className="album-action">{item.story.action} <Icon name="right" /></span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ) : (
            <article className="page-content">
              <div className="breadcrumb">
                <a href="#coleccion">Colección</a>
                <Icon name="right" />
                <span>{track.title}</span>
              </div>
              <div className="track-heading">
                <h1 ref={heading} tabIndex={-1}>
                  {track.story.title}
                </h1>
                <p className="intro">{track.story.introduction}</p>
                <p className="listening-prompt"><Icon name="headset" /><span><strong>Al escuchar. </strong>{track.story.listenFor}</span></p>
              </div>
              <MapStage key={track.id} track={track} />
              <section
                className="track-info"
                aria-label="Información de la pista"
              >
                <div className="info-nav">
                  <div role="group" aria-label="Contenido de la ficha">
                    <button
                      aria-pressed={info === 'track'}
                      onClick={() => setInfo('track')}
                    >
                      <Icon name="book" />
                      Sobre la pista
                    </button>
                    <button
                      aria-pressed={info === 'audio'}
                      onClick={() => setInfo('audio')}
                    >
                      <Icon name="signal" />
                      Guía sonora
                    </button>
                  </div>
                  <a href={track.source} target="_blank" rel="noreferrer">
                    Fuente NASA <Icon name="external" />
                  </a>
                </div>
                {info === 'track' ? (
                  <div className="info-body">
                    <h2>Qué muestra la imagen</h2>
                    <p>{track.pattern}</p>
                    <dl className="facts">
                      {[
                        ['Periodo', track.period],
                        ['Tipo de fuente', track.kind],
                        ['Variable', track.variable],
                        ['Unidad', track.unit],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p>
                      <strong>Límite de interpretación. </strong>
                      {track.limit}
                    </p>
                    <small>{track.credit}</small>
                  </div>
                ) : (
                  <div className="info-body">
                    <h2>Cómo se convierte en sonido</h2>
                    {track.guide.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </div>
                )}
              </section>
            </article>
          )}
        </main>
      </div>
      {!view.welcome && hasSelected && <Player
        track={track}
        index={selected}
        total={tracks.length}
        onPrevious={() => navigate(selected - 1)}
        onNext={() => navigate(selected + 1)}
      />}
      <dialog
        ref={dialog}
        aria-labelledby="dialog-title"
        onClose={() => setModal(null)}
      >
        <div className="dialog-head">
          <h2 id="dialog-title">
            {modal === 'settings' ? 'Accesibilidad' : 'Cómo escuchar'}
          </h2>
          <button
            autoFocus
            aria-label="Cerrar"
            onClick={() => dialog.current?.close()}
          >
            <Icon name="close" />
          </button>
        </div>
        {modal === 'settings' ? (
          <div className="settings">
            <p className="settings__help">
              Usa el lector de pantalla de tu dispositivo, como TalkBack en Android, para escuchar la interfaz.
              La voz integrada de Earthbeat está en desarrollo.
            </p>
            <label>
              <input
                type="checkbox"
                checked={contrast}
                onChange={(e) => setContrast(e.target.checked)}
              />
              Alto contraste
            </label>
            <label>
              <input
                type="checkbox"
                checked={reduced}
                onChange={(e) => setReduced(e.target.checked)}
              />
              Reducir movimiento
            </label>
          </div>
        ) : (
          <div className="help-text">
            <p>
              Elige una de las cuatro pistas en la colección. Puedes leer la
              descripción antes de pulsar Reproducir.
            </p>
            <p>{listeningLegend}</p>
            <h3>Con teclado</h3>
            <p>
              Recorre los controles con Tab y Mayús + Tab. Activa los botones
              con Intro o Espacio. En las barras de avance y volumen, usa las
              flechas, Inicio y Fin. Escape cierra esta ventana.
            </p>
          </div>
        )}
      </dialog>
    </div>
  )
}
