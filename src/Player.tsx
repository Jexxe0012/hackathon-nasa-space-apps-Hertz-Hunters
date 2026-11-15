import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type SyntheticEvent,
} from 'react'
import type { Track } from './data'
import './player.css'

type PlayerProps = {
  track: Track
  index: number
  total: number
  onPrevious: () => void
  onNext: () => void
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
}: PlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [media, setMedia] = useState(() => initialMediaState(track.id))
  const [volume, setVolume] = useState(65)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const { current, duration, playing, error } =
    media.id === track.id ? media : initialMediaState(track.id)

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
        ? 'No se pudo cargar esta pista. Pulsa Reintentar.'
        : '',
    })
  }

  async function togglePlayback() {
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
        error: 'No se pudo reproducir el audio. Pulsa Reintentar.',
      }))
    }
  }

  function seek(to: number) {
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

  const playLabel = error ? 'Reintentar' : playing ? 'Pausar' : 'Reproducir'
  const digits = (value: number) => String(value).padStart(2, '0')

  return (
    <section
      className="hh-player"
      aria-label="Reproductor de sonificaciones"
      id="reproductor"
      tabIndex={-1}
    >
      <audio
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
      />
      <div className="hh-player__track">
        <img src={track.image} alt="" width="52" height="52" />
        <div>
          <span className="hh-player__track-number">
            Pista {digits(index + 1)} / {digits(total)}
          </span>
          <strong>{track.shortTitle}</strong>
        </div>
      </div>
      <div className="hh-player__transport">
        <div className="hh-player__buttons">
          <button
            type="button"
            aria-label="Pista anterior"
            title="Pista anterior"
            onClick={onPrevious}
          >
            <PixelIcon icon="previous" />
          </button>
          <button
            type="button"
            className="hh-player__play"
            onClick={togglePlayback}
            aria-label={playLabel + ' ' + track.title}
          >
            <PixelIcon icon={playing ? 'pause' : 'play'} />
            <span>{playLabel}</span>
          </button>
          <button
            type="button"
            aria-label="Pista siguiente"
            title="Pista siguiente"
            onClick={onNext}
          >
            <PixelIcon icon="next" />
          </button>
          <button
            type="button"
            className="hh-player__skip"
            aria-label="Avanzar 15 segundos"
            title="Avanzar 15 segundos"
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
            aria-label="Posición de escucha"
            min={0}
            max={duration || 1}
            step={1}
            value={current}
            aria-valuetext={`${Math.floor(current)} de ${Math.round(duration)} segundos`}
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
            aria-label={silent ? 'Activar sonido' : 'Silenciar'}
            title={silent ? 'Activar sonido' : 'Silenciar'}
            onClick={toggleMute}
          >
            <PixelIcon icon={silent ? 'muted' : 'speaker'} />
          </button>
          <input
            type="range"
            aria-label="Volumen"
            min={0}
            max={100}
            step={1}
            value={muted ? 0 : volume}
            aria-valuetext={`${muted ? 0 : volume} por ciento`}
            style={rangeStyle(muted ? 0 : volume, 100)}
            onChange={(event) => {
              setVolume(event.currentTarget.valueAsNumber)
              setMuted(false)
            }}
          />
        </div>
        <select
          aria-label="Velocidad de reproducción"
          title="Velocidad de reproducción"
          value={rate}
          onChange={(event) => setRate(Number(event.currentTarget.value))}
        >
          <option value={0.75}>0,75×</option>
          <option value={1}>1×</option>
          <option value={1.25}>1,25×</option>
          <option value={1.5}>1,5×</option>
        </select>
      </div>
      <span className="hh-player__announcement" role="status">
        {playing ? 'Reproduciendo' : 'En pausa'} · {track.title}
      </span>
      {error && (
        <p className="hh-player__error" role="alert">
          {error}
        </p>
      )}
    </section>
  )
}

export default Player
