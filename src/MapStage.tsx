import { useEffect, useRef, useState } from 'react'
import type { Track } from './data'
import { useLanguage } from './i18n'
import './map-stage.css'

type StageProps = { track: Track; guided?: boolean; highContrast?: boolean }

export function MapStage({ track, guided = false, highContrast = false }: StageProps) {
  const { language, t } = useLanguage()
  const initialLanguage = useRef(language)
  const frame = useRef<HTMLIFrameElement>(null)
  const [height, setHeight] = useState(520)
  const updateLanguage = () => frame.current?.contentWindow?.postMessage({ eij: 'idioma', valor: language }, location.origin)

  useEffect(() => { updateLanguage() }, [language, track.scene])

  // La escena sonora informa su alto para que el visor la muestre completa
  useEffect(() => {
    if (!track.scene) return
    const onMessage = (event: MessageEvent) => {
      const data = event.data
      if (!frame.current || event.source !== frame.current.contentWindow) return
      if (data && data.eij === 'alto' && Number.isFinite(data.px)) setHeight(Math.max(320, Math.min(2600, data.px)))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [track.scene])

  return (
    <figure className="map-stage" aria-label={t('Visualization of {title}', { title: track.title })}>
      <figcaption className="map-stage__caption">
        <span className="map-stage__source">
          <span className="map-stage__mark" aria-hidden="true" />
          {track.credit}
        </span>
      </figcaption>
      <div className={'map-stage__field' + (track.scene ? ' map-stage__field--escena' : '')}>
        <span className="map-stage__ruler" aria-hidden="true" />
        {track.scene ? (
          <iframe
            ref={frame}
            className="escena-sonora"
            src={track.scene + `&lang=${initialLanguage.current}` + (guided ? `&guiado=1&contraste=${highContrast ? 1 : 0}` : '')}
            onLoad={updateLanguage}
            title={guided ? t('Sound scene options for {title}', { title: track.title }) : t('Sound scene for {title}: map, scanning line, and exploration controls', { title: track.title })}
            style={{ height }}
            allow="autoplay"
          />
        ) : (
          <div className="plate-image">
            <img src={track.image} alt={track.alt} className="plate-original" />
          </div>
        )}
        <i className="map-stage__corner map-stage__corner--nw" aria-hidden="true" />
        <i className="map-stage__corner map-stage__corner--ne" aria-hidden="true" />
        <i className="map-stage__corner map-stage__corner--sw" aria-hidden="true" />
        <i className="map-stage__corner map-stage__corner--se" aria-hidden="true" />
      </div>
    </figure>
  )
}

export default MapStage
