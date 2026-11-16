import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type SyntheticEvent,
} from 'react'
import type { Track } from './data'
import './player.css'
import { useLanguage } from './i18n'

type PlayerProps = {
  track: Track
  index: number
  total: number
  onPrevious: () => void
  onNext: () => void
  onBeforePlay?: () => void
}

type Icon = 'previous' | 'play' | 'pause' | 'next' | 'speaker' | 'muted'

const paths: Record<Icon, string> = {
  previous: 'M2 3h3v10H2zM13 3v10h-2v-1H9v-1H7V9H5V7h2V5h2V4h2V3z',
  next: 'M11 3h3v10h-3zM3 3h2v1h2v1h2v2h2v2H9v2H7v1H5v1H3z',
  play: 'M4 2h2v1h2v2h2v1h2v1h2v2h-2v1h-2v1H8v2H6v1H4z',
  pause: 'M3 2h4v12H3zM10 2h4v12h-4z',
  speaker:
    'M1 6h3V5h2V3h2V2h1v12H8v-1H6v-2H4v-1H1zM11 5h1v1h1v4h-1v1h-1zM13 2h1v2h1v2h1v4h-1v2h-1v2h-1v-3h1V5h-1z',
  muted:
    'M1 6h3V5h2V3h2V2h1v12H8v-1H6v-2H4v-1H1zM10 5h2v2h2V5h2v2h-2v2h2v2h-2V9h-2v2h-2V9h2V7h-2z',
}

function PixelIcon({ icon }: { icon: Icon }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 16 16"
      width="20"
      height="20"
      shapeRendering="crispEdges"
    >
      <path d={paths[icon]} fill="currentColor" />
    </svg>
  )
}

function clock(seconds: number) {
  const whole = Math.max(0, Math.floor(seconds))
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`
}

function rangeStyle(position: number, max: number): CSSProperties {
  return {
    '--hh-range-fill': `${max ? (position / max) * 100 : 0}%`,
  } as CSSProperties
}

type MediaState = {
  id: Track['id']
  current: number
  duration: number
  playing: boolean
  error: string
}

function initialMediaState(id: Track['id']): MediaState {
  return { id, current: 0, duration: 0, playing: false, error: '' }
}

export function Player({
  track,
  index,
  total,
  onPrevious,
  onNext,
  onBeforePlay,
}: PlayerProps) {
  const { t } = useLanguage()
  const audioRef = useRef<HTMLAudioElement>(null)
  const [media, setMedia] = useState(() => initialMediaState(track.id))
  const [volume, setVolume] = useState(65)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const { current, duration, playing, error } =
    media.id === track.id ? media : initialMediaState(track.id)

  // Pistas con escena sonora: el reproductor controla el motor de sonido del visor (iframe) por mensajes
  const scene = Boolean(track.scene)
  const volumeNow = useRef(volume / 100)
  volumeNow.current = muted ? 0 : volume / 100
  const sceneWindow = () =>
    document.querySelector<HTMLIFrameElement>('iframe.escena-sonora')?.contentWindow ?? null
  const sendScene = (message: Record<string, unknown>) => sceneWindow()?.postMessage(message, '*')

  useEffect(() => {
    if (!scene) return
    let volumeSent = false
    const onMessage = (event: MessageEvent) => {
      const data = event.data
      if (!data || data.eij !== 'estado' || event.source !== sceneWindow()) return
      if (!volumeSent) {
        volumeSent = true
        sendScene({ eij: 'volumen', valor: volumeNow.current })
      }
      setMedia({
        id: track.id,
        current: Number(data.pos) || 0,
        duration: Number(data.dur) || 0,
        playing: Boolean(data.sonando),
        error: '',
      })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [scene, track.id])

  useEffect(() => {
    if (scene) sendScene({ eij: 'volumen', valor: muted ? 0 : volume / 100 })
  }, [scene, volume, muted, track.id])

  useEffect(() => {
    const audio = audioRef.current
    return () => {
      audio?.pause()
    }
  }, [track.id])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume / 100
    audio.muted = muted
    audio.playbackRate = rate
  }, [volume, muted, rate, track.id])

  function syncMedia(event: SyntheticEvent<HTMLAudioElement>) {
    const audio = event.currentTarget
    if (audio !== audioRef.current) return
    setMedia({
      id: track.id,
      current: audio.currentTime || 0,
      duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      playing: !audio.paused && !audio.ended,
      error: audio.error
        ? t("This track could not load. Press Retry.")
        : '',
    })
  }

  async function togglePlayback() {
    onBeforePlay?.()
    if (scene) {
      sendScene({ eij: 'alternar' })
      return
    }
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
      return
    }
    if (audio.error) audio.load()
    try {
      await audio.play()
    } catch (reason) {
      if (
        audio !== audioRef.current ||
        (reason instanceof DOMException && reason.name === 'AbortError')
      )
        return
      setMedia((previous) => ({
        ...(previous.id === track.id ? previous : initialMediaState(track.id)),
        playing: false,
        error: "The audio could not play. Press Retry.",
      }))
    }
  }

  function seek(to: number) {
    if (scene) {
      if (duration) sendScene({ eij: 'ir', fraccion: Math.min(duration, Math.max(0, to)) / duration })
      return
    }
    const audio = audioRef.current
    if (!audio || !duration) return
    audio.currentTime = Math.min(duration, Math.max(0, to))
    setMedia((previous) => ({ ...previous, current: audio.currentTime }))
  }

  const silent = muted || volume === 0
  function toggleMute() {
    if (silent && volume === 0) setVolume(65)
    setMuted(!silent)
  }

  const playLabel = error ? t("Retry") : playing ? t("Pause") : t("Play")
  const digits = (value: number) => String(value).padStart(2, '0')

  return (
    <section
      className="hh-player"
      aria-label={t("Sonification player")}
      id="reproductor"
      tabIndex={-1}
    >
      {!scene && <audio
        key={track.id}
        ref={audioRef}
        src={track.audio}
        preload="metadata"
        onLoadedMetadata={syncMedia}
        onDurationChange={syncMedia}
        onTimeUpdate={syncMedia}
        onPlay={syncMedia}
        onPause={syncMedia}
        onEnded={syncMedia}
        onError={syncMedia}
      />}
      <div className="hh-player__track">
        <img src={track.image} alt="" width="52" height="52" />
        <div>
          <span className="hh-player__track-number">
            {t('Track {current} of {total} · {kind}', { current: digits(index + 1), total: digits(total), kind: t(scene ? 'Sound engine' : 'Sample audio') })}
          </span>
          <strong>{track.shortTitle}</strong>
        </div>
      </div>
      <div className="hh-player__transport">
        <div className="hh-player__buttons">
          <button
            type="button"
            aria-label={t("Previous track")}
            title={t("Previous track")}
            onClick={onPrevious}
          >
            <PixelIcon icon="previous" />
          </button>
          <button
            type="button"
            className="hh-player__play"
            onClick={togglePlayback}
            aria-label={t('{action} {title}', { action: playLabel, title: track.title })}
          >
            <PixelIcon icon={playing ? 'pause' : 'play'} />
            <span>{playLabel}</span>
          </button>
          <button
            type="button"
            aria-label={t("Next track")}
            title={t("Next track")}
            onClick={onNext}
          >
            <PixelIcon icon="next" />
          </button>
          <button
            type="button"
            className="hh-player__skip"
            aria-label={t("Skip forward 15 seconds")}
            title={t("Skip forward 15 seconds")}
            disabled={!duration || current >= duration}
            onClick={() => seek(current + 15)}
          >
            +15 s
          </button>
        </div>
        <label className="hh-player__progress">
          <span aria-hidden="true">{clock(current)}</span>
          <input
            type="range"
            aria-label={t("Playback position")}
            min={0}
            max={duration || 1}
            step={1}
            value={current}
            aria-valuetext={t('{current} of {duration} seconds', { current: Math.floor(current), duration: Math.round(duration) })}
            disabled={!duration}
            style={rangeStyle(current, duration)}
            onChange={(event) => seek(event.currentTarget.valueAsNumber)}
          />
          <span aria-hidden="true">{duration ? clock(duration) : '–:––'}</span>
        </label>
      </div>
      <div className="hh-player__settings">
        <div className="hh-player__volume">
          <button
            type="button"
            aria-label={silent ? t("Unmute") : t("Mute")}
            title={silent ? t("Unmute") : t("Mute")}
            onClick={toggleMute}
          >
            <PixelIcon icon={silent ? 'muted' : 'speaker'} />
          </button>
          <input
            type="range"
            aria-label={t("Volume")}
            min={0}
            max={100}
            step={1}
            value={muted ? 0 : volume}
            aria-valuetext={t('{volume} percent', { volume: muted ? 0 : volume })}
            style={rangeStyle(muted ? 0 : volume, 100)}
            onChange={(event) => {
              setVolume(event.currentTarget.valueAsNumber)
              setMuted(false)
            }}
          />
        </div>
        <select
          aria-label={t("Playback speed")}
          title={scene ? t("The sound scene runs at its own speed") : t("Playback speed")}
          disabled={scene}
          value={rate}
          onChange={(event) => setRate(Number(event.currentTarget.value))}
        >
          <option value={0.75}>{t('0.75×')}</option>
          <option value={1}>1×</option>
          <option value={1.25}>{t('1.25×')}</option>
          <option value={1.5}>{t('1.5×')}</option>
        </select>
      </div>
      <span className="hh-player__announcement" role="status">
        {t('{state} · {title}', { state: t(playing ? 'Playing' : 'Paused'), title: track.title })}
      </span>
      {error && (
        <p className="hh-player__error" role="alert">
          {t(error)}
        </p>
      )}
    </section>
  )
}

export default Player
