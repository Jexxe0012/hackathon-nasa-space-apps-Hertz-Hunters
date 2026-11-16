import { useEffect, useRef, useState } from 'react'
import { tracks, getTracks, listeningLegend } from './data'
import { LanguageSwitcher, useLanguage } from './i18n'
import { Icon, Sprite } from './Art'
import Player from './Player'
import MapStage from './MapStage'
import { WelcomeGlobe } from './WelcomeGlobe'
import GuidedExperience from './GuidedExperience'

const families = [
  "Oceans",
  "Forests",
  "Atmosphere",
  "Human footprint",
]
const spriteIndexes = [1, 8, 3, 0]
const voiceNotice =
  "You can use TalkBack or another screen reader. Earthbeat also offers a guided experience with optional narration."
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
  const [experience, setExperience] = useState<'guided' | 'visual'>(() => {
    try { return localStorage.getItem('earthbeat.experience') === 'visual' ? 'visual' : 'guided' } catch { return 'guided' }
  })
  function changeExperience(next: 'guided' | 'visual') {
    try { localStorage.setItem('earthbeat.experience', next) } catch { /* Available for this visit. */ }
    setExperience(next)
  }
  return experience === 'guided'
    ? <GuidedExperience onVisualMode={() => changeExperience('visual')} />
    : <VisualExperience onGuidedMode={() => changeExperience('guided')} />
}

function VisualExperience({ onGuidedMode }: { onGuidedMode: () => void }) {
  const { language, t } = useLanguage()
  const tracks = getTracks(language)
  const localizedVoiceNotice = t(voiceNotice)
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
  const showPlayer = !view.welcome && !view.library && hasSelected
  const previousRoute = useRef(view.welcome ? 'welcome' : view.library ? 'collection' : track.id)

  useEffect(() => {
    if (!noticeVisible) {
      setNoticeAnnouncement('')
      return
    }
    setNoticeAnnouncement('')
    const timer = window.setTimeout(() => setNoticeAnnouncement(localizedVoiceNotice), 600)
    return () => window.clearTimeout(timer)
  }, [noticeVisible, localizedVoiceNotice])

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
      (view.welcome ? t("Welcome") : view.library ? t("Collection") : track.title) + ' · Earthbeat'
    main.current?.scrollTo(0, 0)
    const route = view.welcome ? 'welcome' : view.library ? 'collection' : track.id
    if (previousRoute.current !== route && !document.activeElement?.closest('#reproductor'))
      heading.current?.focus({ preventScroll: true })
    previousRoute.current = route
  }, [view.welcome, view.library, track.id, track.title, t])
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
      >{t("Skip to content")}</a>
      <a
        className="skip"
        href="#ajustes"
        aria-haspopup="dialog"
        onClick={(event) => {
          event.preventDefault()
          setModal('settings')
        }}
      >{t("Go to accessibility options")}</a>
      {showPlayer && <a
        className="skip"
        href="#reproductor"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('reproductor')?.focus()
        }}
      >{t("Skip to player")}</a>}
      <header className="masthead">
        <a
          className="brand"
          href="#inicio"
          aria-label={t("Earthbeat, go to home")}
        >
          <Sprite className="brand-planet" />
          <span>Earthbeat</span>
        </a>
        <nav className="primary-nav" aria-label={t("Main navigation")}>
          <a
            href={trackHref(selected)}
            aria-current={!view.library && !view.welcome ? 'page' : undefined}
          >
            <Icon name="signal" />
            <span>{t("Player")}</span>
          </a>
          <a href="#coleccion" aria-current={view.library ? 'page' : undefined}>
            <Icon name="grid" />
            <span>{t("Collection")}</span>
          </a>
        </nav>
        <div className="utilities">
          <LanguageSwitcher />
          <button type="button" aria-label={t("Open guided experience")} onClick={onGuidedMode}><Icon name="headset" /><span>{t("Guided experience")}</span></button>
          <button
            aria-label={t("Accessibility settings")}
            onClick={() => setModal('settings')}
          >
            <Icon name="sliders" />
            <span>{t("Settings")}</span>
          </button>
          <button
            className="help-btn"
            aria-label={t("Help")}
            title={t("Help")}
            onClick={() => setModal('help')}
          >
            <Icon name="help" />
          </button>
        </div>
      </header>
      <div className={view.welcome ? 'workarea workarea--welcome' : 'workarea'}>
        {!view.welcome && <aside className="library" aria-label={t("Track library")}>
          <div className="library-title">
            <h2>{t("Library")}</h2>
            <span>{number(tracks.length - 1)}</span>
          </div>
          <nav aria-label={t("Choose a track")}>
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
                      <small>{t(families[i])}</small>
                    </span>
                    {hasSelected && selected === i && (
                      <span
                        className="selected-light"
                        aria-label={t("Selected track")}
                      />
                    )}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <button className="listen-help" onClick={() => setModal('help')}>
            <Icon name="headset" />{t("How to listen")}</button>
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
                <span aria-hidden="true"><strong>{t("Accessibility notice.")}</strong> {localizedVoiceNotice}</span>
                <span className="screen-reader-only" role="status" aria-live="polite" aria-atomic="true">
                  {noticeAnnouncement ? t("Accessibility notice. ") + noticeAnnouncement : ''}
                </span>
              </p>
              <button type="button" aria-label={t("Dismiss accessibility notice")} onClick={() => {
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
                  <h1 ref={heading} tabIndex={-1}>{t("You can hear the Earth, too.")}</h1>
                  <p className="welcome__lead">{t("Discover stories of our planet through NASA data. Listen to the ocean, explore a forest, and revisit a year you remember.")}</p>
                  <a className="welcome__action" href="#coleccion">{t("Explore the collection")}<Icon name="right" />
                  </a>
                  <button className="welcome__accessibility" type="button" aria-haspopup="dialog" onClick={() => setModal('settings')}>
                    <Icon name="sliders" />{t("Accessibility options")}</button>
                  <p className="welcome__note">{t("You can navigate with a keyboard and use a screen reader.")}</p>
                </div>
                <WelcomeGlobe reducedMotion={reduced} forestImage={tracks[1].image} />
              </div>
              <section className="welcome__story" aria-labelledby="welcome-story-title">
                <img src={tracks[3].image} alt="" loading="lazy" />
                <div>
                  <h2 id="welcome-story-title">{tracks[3].story.title}</h2>
                  <p>{tracks[3].story.teaser} {t("Compare its night lights with those of 2019.")}</p>
                  <a href={trackHref(3)}>{tracks[3].story.action} <Icon name="right" /></a>
                </div>
              </section>
              <section className="welcome__guide" aria-labelledby="welcome-guide-title">
                <h2 id="welcome-guide-title">{t("How does it work?")}</h2>
                <ol className="welcome__steps">
                  <li><Icon name="grid"/><div><h3>{t("Choose a story")}</h3><p>{t("Start with a question that makes you curious about Earth.")}</p></div></li>
                  <li><Icon name="book"/><div><h3>{t("Learn how to listen")}</h3><p>{t("Learn what each sound represents and what the data can tell you.")}</p></div></li>
                  <li><Icon name="headset"/><div><h3>{t("Explore at your own pace")}</h3><p>{t("Play, pause, and use the scene controls to explore the story.")}</p></div></li>
                </ol>
                <p className="welcome__disclaimer">{t("What you hear is a sonification: instruments represent data. Descriptions guide you through each journey.")}</p>
              </section>
            </div>
          ) : view.library ? (
            <div className="page-content">
              <h1 ref={heading} tabIndex={-1}>{t("Collection")}</h1>
              <p className="intro">{t("Four stories to bring you closer to Earth. Choose a question and explore the data behind it.")}</p>
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
                <a href="#coleccion">{t("Collection")}</a>
                <Icon name="right" />
                <span>{track.title}</span>
              </div>
              <div className="track-heading">
                <h1 ref={heading} tabIndex={-1}>
                  {track.story.title}
                </h1>
                <p className="intro">{track.story.introduction}</p>
                <p className="listening-prompt"><Icon name="headset" /><span><strong>{t("Listen for:")} </strong>{track.story.listenFor}</span></p>
              </div>
              <MapStage key={track.id} track={track} />
              <section
                className="track-info"
                aria-label={t("Track information")}
              >
                <div className="info-nav">
                  <div role="group" aria-label={t("Information sections")}>
                    <button
                      aria-pressed={info === 'track'}
                      onClick={() => setInfo('track')}
                    >
                      <Icon name="book" />{t("About this track")}</button>
                    <button
                      aria-pressed={info === 'audio'}
                      onClick={() => setInfo('audio')}
                    >
                      <Icon name="signal" />{t("Sound guide")}</button>
                  </div>
                  <a href={track.source} target="_blank" rel="noreferrer">{t("NASA source")}<Icon name="external" />
                  </a>
                </div>
                {info === 'track' ? (
                  <div className="info-body">
                    <h2>{t("What the image shows")}</h2>
                    <p>{track.pattern}</p>
                    <dl className="facts">
                      {[
                        [t("Period"), track.period],
                        [t("Source type"), track.kind],
                        [t("Variable"), track.variable],
                        [t("Unit"), track.unit],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                    <p>
                      <strong>{t("Interpretation limit.")} </strong>
                      {track.limit}
                    </p>
                    <small>{track.credit}</small>
                  </div>
                ) : (
                  <div className="info-body">
                    <h2>{t("How the data becomes sound")}</h2>
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
      {showPlayer && <Player
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
            {modal === 'settings' ? t("Accessibility") : t("How to listen")}
          </h2>
          <button
            autoFocus
            aria-label={t("Close")}
            onClick={() => dialog.current?.close()}
          >
            <Icon name="close" />
          </button>
        </div>
        {modal === 'settings' ? (
          <div className="settings">
            <p className="settings__help">{t("You can use TalkBack on Android or another screen reader. The guided experience offers a step-by-step journey and optional Earthbeat narration.")}</p>
            <button type="button" onClick={onGuidedMode}>{t("Open guided experience")}</button>
            <label>
              <input
                type="checkbox"
                checked={contrast}
                onChange={(e) => setContrast(e.target.checked)}
              />{t("High contrast")}</label>
            <label>
              <input
                type="checkbox"
                checked={reduced}
                onChange={(e) => setReduced(e.target.checked)}
              />{t("Reduce motion")}</label>
          </div>
        ) : (
          <div className="help-text">
            <p>{t("Choose one of the four tracks in the collection. You can read its description before pressing Play.")}</p>
            <p>{t(listeningLegend)}</p>
            <h3>{t("Using a keyboard")}</h3>
            <p>{t("Move through controls with Tab and Shift + Tab. Activate buttons with Enter or Space. Use the arrow keys, Home, and End on the progress and volume sliders. Escape closes this window.")}</p>
          </div>
        )}
      </dialog>
    </div>
  )
}
