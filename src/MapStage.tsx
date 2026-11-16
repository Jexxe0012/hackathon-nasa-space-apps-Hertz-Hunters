import type { Track } from './data'
import './map-stage.css'

type StageProps = { track: Track }

export function MapStage({ track }: StageProps) {
  return (
    <figure className="map-stage" aria-label={`Visualización de ${track.title}`}>
      <figcaption className="map-stage__caption">
        <span className="map-stage__source">
          <span className="map-stage__mark" aria-hidden="true" />
          {track.credit}
        </span>
      </figcaption>
      <div className="map-stage__field">
        <span className="map-stage__ruler" aria-hidden="true" />
        <div className="plate-image">
          <img src={track.image} alt={track.alt} className="plate-original" />
        </div>
        <i className="map-stage__corner map-stage__corner--nw" aria-hidden="true" />
        <i className="map-stage__corner map-stage__corner--ne" aria-hidden="true" />
        <i className="map-stage__corner map-stage__corner--sw" aria-hidden="true" />
        <i className="map-stage__corner map-stage__corner--se" aria-hidden="true" />
      </div>
    </figure>
  )
}

export default MapStage
